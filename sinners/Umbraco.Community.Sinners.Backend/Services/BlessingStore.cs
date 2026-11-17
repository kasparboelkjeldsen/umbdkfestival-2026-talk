using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using Umbraco.Community.Sinners.Backend.Configuration;

namespace Umbraco.Community.Sinners.Backend.Services;

public enum BlessingKind
{
    /// <summary>I: "compositionAlias.propertyAlias"</summary>
    CompositionProperty,
    /// <summary>V: a config key such as "Umbraco:CMS:Runtime:Mode"</summary>
    ProductionSetting,
    /// <summary>VI: a content type alias</summary>
    Alias,
    /// <summary>VI: a dictionary item key</summary>
    TranslationKey,
}

/// <summary>
/// Bless decisions ("this is fine, I accept this sin") live in a JSON file in the site, not in the database,
/// so a <c>git diff</c> of it shows on stage exactly what was forgiven. Pretty-printed, every section always
/// present, values sorted ordinally: the same decisions always produce the same bytes.
/// Path: <see cref="SinnersSettings.BlessingsPath"/> (default <c>sinners.blessings.json</c> in the content root).
/// </summary>
public class BlessingStore(IOptionsMonitor<SinnersSettings> settings, IWebHostEnvironment env)
{
    private record Section(string Commandment, string Rule, BlessingKind Kind, string ListName);

    // File order. VI holds two lists, so sections are grouped by commandment when written.
    private static readonly Section[] Sections =
    [
        new("I", "Content is not composable", BlessingKind.CompositionProperty, "compositionProperties"),
        new("V", "A production site runs in production mode", BlessingKind.ProductionSetting, "settings"),
        new("VI", "Thy names", BlessingKind.Alias, "aliases"),
        new("VI", "Thy names", BlessingKind.TranslationKey, "translationKeys"),
    ];

    private readonly Lock _lock = new();
    private (string Path, DateTime WriteTime, Dictionary<BlessingKind, SortedSet<string>> Data)? _cache;

    public string FilePath
    {
        get
        {
            var configured = settings.CurrentValue.BlessingsPath;
            if (string.IsNullOrWhiteSpace(configured)) configured = "sinners.blessings.json";
            return Path.IsPathRooted(configured) ? configured : Path.Combine(env.ContentRootPath, configured);
        }
    }

    public HashSet<string> GetBlessed(BlessingKind kind)
    {
        lock (_lock)
            return new HashSet<string>(Load()[kind], StringComparer.OrdinalIgnoreCase);
    }

    public void SetBlessed(BlessingKind kind, string value, bool blessed)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        lock (_lock)
        {
            var data = Load();
            var set = data[kind];
            var existing = set.FirstOrDefault(v => string.Equals(v, value, StringComparison.OrdinalIgnoreCase));
            var changed = blessed
                ? existing is null && set.Add(value)
                : existing is not null && set.Remove(existing);
            if (changed) Write(data);
        }
    }

    private Dictionary<BlessingKind, SortedSet<string>> Load()
    {
        var path = FilePath;
        var writeTime = File.Exists(path) ? File.GetLastWriteTimeUtc(path) : DateTime.MinValue;
        if (_cache is { } c && c.Path == path && c.WriteTime == writeTime)
            return c.Data;

        var data = Sections.ToDictionary(s => s.Kind, _ => new SortedSet<string>(StringComparer.Ordinal));
        if (writeTime != DateTime.MinValue)
        {
            try
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(path));
                foreach (var s in Sections)
                {
                    if (doc.RootElement.TryGetProperty(s.Commandment, out var section)
                        && section.ValueKind == JsonValueKind.Object
                        && section.TryGetProperty(s.ListName, out var list)
                        && list.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in list.EnumerateArray())
                            if (item.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(item.GetString()))
                                data[s.Kind].Add(item.GetString()!);
                    }
                }
            }
            catch (JsonException) { /* a hand-mangled file blesses nothing */ }
        }

        _cache = (path, writeTime, data);
        return data;
    }

    private void Write(Dictionary<BlessingKind, SortedSet<string>> data)
    {
        var path = FilePath;
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        using var stream = new MemoryStream();
        using (var writer = new Utf8JsonWriter(stream, new JsonWriterOptions
               {
                   Indented = true,
                   Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
               }))
        {
            writer.WriteStartObject();
            foreach (var group in Sections.GroupBy(s => s.Commandment))
            {
                writer.WriteStartObject(group.Key);
                writer.WriteString("rule", group.First().Rule);
                foreach (var s in group)
                {
                    writer.WriteStartArray(s.ListName);
                    foreach (var value in data[s.Kind]) writer.WriteStringValue(value);
                    writer.WriteEndArray();
                }
                writer.WriteEndObject();
            }
            writer.WriteEndObject();
        }

        // LF line endings and a trailing newline, so the diff is clean on every platform
        var json = Encoding.UTF8.GetString(stream.ToArray()).Replace("\r\n", "\n") + "\n";
        File.WriteAllText(path, json, new UTF8Encoding(false));
        _cache = (path, File.GetLastWriteTimeUtc(path), data);
    }
}
