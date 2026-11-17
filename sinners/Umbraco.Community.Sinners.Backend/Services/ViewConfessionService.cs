using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;

namespace Umbraco.Community.Sinners.Backend.Services;

/// <summary>
/// Commandment VII: views render, they don't search. Greps the site's <c>Views/</c> (recursively, *.cshtml) for
/// tree walks and the content service. Each hit is a sin. Code can't be fixed from a web request (not even
/// by us), so the only absolution is confession: <see cref="Confess"/> remembers the hits it was shown, and a
/// confessed hit no longer counts. Edit the line and it's a new sin.
/// </summary>
public class ViewConfessionService(IWebHostEnvironment env, PenanceStateStore stateStore)
{
    private record Pattern(string Id, string Label, Regex Regex);

    private static readonly Pattern[] Patterns =
    [
        new("descendants", ".Descendants()", new Regex(@"\.Descendants\s*(<[^>()]*>)?\s*\(", RegexOptions.Compiled)),
        new("descendants-or-self", "DescendantsOrSelf()", new Regex(@"DescendantsOrSelf\s*(<[^>()]*>)?\s*\(", RegexOptions.Compiled)),
        new("content-service", "@inject IContentService", new Regex(@"@inject\s+(global::)?(Umbraco\.Cms\.Core\.Services\.)?IContentService\b", RegexOptions.Compiled)),
    ];

    private static readonly Lock CacheLock = new();
    private static (DateTime At, string Root, List<ViewSinModel> Hits)? _cache;
    private static readonly TimeSpan CacheFor = TimeSpan.FromSeconds(2);

    public ViewConfessionResult Audit()
    {
        var hits = Scan();
        var confessed = stateStore.Read().Confessed.ToHashSet(StringComparer.Ordinal);
        var models = hits.Select(h => h with { IsConfessed = confessed.Contains(h.Signature) }).ToList();
        return new ViewConfessionResult
        {
            ViewsFound = Directory.Exists(ViewsRoot),
            Hits = models,
        };
    }

    /// <summary>Confess every current hit. Returns how many were newly confessed.</summary>
    public int Confess()
    {
        var hits = Scan(force: true);
        var added = 0;
        stateStore.Update(s =>
        {
            var set = s.Confessed.ToHashSet(StringComparer.Ordinal);
            foreach (var h in hits)
                if (set.Add(h.Signature)) added++;
            s.Confessed = set.Order(StringComparer.Ordinal).ToList();
        });
        return added;
    }

    private string ViewsRoot => Path.Combine(env.ContentRootPath, "Views");

    // The status endpoint is polled every couple of seconds: walking the Views folder that often is wasteful,
    // so the scan is cached briefly (static: the service is scoped).
    private List<ViewSinModel> Scan(bool force = false)
    {
        var root = ViewsRoot;
        lock (CacheLock)
        {
            if (!force && _cache is { } c && c.Root == root && DateTime.UtcNow - c.At < CacheFor)
                return c.Hits;
        }

        var hits = new List<ViewSinModel>();
        if (Directory.Exists(root))
        {
            foreach (var file in Directory.EnumerateFiles(root, "*.cshtml", SearchOption.AllDirectories).Order(StringComparer.OrdinalIgnoreCase))
            {
                string[] lines;
                try { lines = File.ReadAllLines(file); }
                catch (IOException) { continue; }

                var relative = "Views/" + Path.GetRelativePath(root, file).Replace('\\', '/');
                for (var i = 0; i < lines.Length; i++)
                {
                    var line = lines[i];
                    foreach (var p in Patterns)
                    {
                        if (!p.Regex.IsMatch(line)) continue;
                        var text = line.Trim();
                        hits.Add(new ViewSinModel
                        {
                            File = relative,
                            Line = i + 1,
                            Text = text,
                            Pattern = p.Label,
                            // Line numbers move when code moves; the file and the text are the sin
                            Signature = $"{relative}|{p.Id}|{text}",
                        });
                    }
                }
            }
        }

        lock (CacheLock) _cache = (DateTime.UtcNow, root, hits);
        return hits;
    }
}

public record ViewConfessionResult
{
    public required bool ViewsFound { get; init; }
    public required IReadOnlyList<ViewSinModel> Hits { get; init; }
}

public record ViewSinModel
{
    /// <summary>Relative to the content root, forward slashes: "Views/Partials/megaMenu.cshtml".</summary>
    public required string File { get; init; }
    public required int Line { get; init; }
    public required string Text { get; init; }
    public required string Pattern { get; init; }
    public required string Signature { get; init; }
    public bool IsConfessed { get; init; }
}
