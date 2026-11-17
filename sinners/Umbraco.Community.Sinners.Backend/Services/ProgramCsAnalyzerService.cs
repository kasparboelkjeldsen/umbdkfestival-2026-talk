using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;

namespace Umbraco.Community.Sinners.Backend.Services;

public class ProgramCsAnalyzerService(IWebHostEnvironment env)
{
    private static readonly string[] AllowedMiddleware = ["UseBackOffice", "UseWebsite"];
    private static readonly string[] AllowedEndpoints = ["UseBackOfficeEndpoints", "UseWebsiteEndpoints"];

    public ProgramCsAuditResult Audit()
    {
        var path = Path.Combine(env.ContentRootPath, "Program.cs");
        if (!File.Exists(path))
            return new ProgramCsAuditResult { Found = false };

        var source = File.ReadAllText(path);

        // Detect: something = app.UseUmbraco() — result stored rather than chained
        var savedToVar = Regex.IsMatch(source, @"\w\s*=\s*(?:\w+\.)*UseUmbraco\s*\(\s*\)");

        var middlewareBody = ExtractCallBody(source, "WithMiddleware");
        var endpointBody = ExtractCallBody(source, "WithEndpoints");

        return new ProgramCsAuditResult
        {
            Found = true,
            UseUmbracoSavedToVariable = savedToVar,
            ExtraMiddleware = middlewareBody is not null
                ? FindNonStandardCalls(middlewareBody, AllowedMiddleware)
                : [],
            ExtraEndpoints = endpointBody is not null
                ? FindNonStandardCalls(endpointBody, AllowedEndpoints)
                : [],
        };
    }

    public bool FixSavedVariable()
    {
        var path = Path.Combine(env.ContentRootPath, "Program.cs");
        if (!File.Exists(path)) return false;

        var source = File.ReadAllText(path);
        var match = Regex.Match(source, @"var\s+(.+?)\s*=\s*(?:\w+\.)*UseUmbraco\s*\(\s*\)\s*;");
        if (!match.Success) return false;

        var varName = match.Groups[1].Value.Trim();
        var result = Regex.Replace(source, @"var\s+.+?\s*=\s*(?:\w+\.)*UseUmbraco\s*\(\s*\)\s*;", "app.UseUmbraco()");
        // "zalgo.WithMiddleware(" → ".WithMiddleware(", then pull it up under app.UseUmbraco()
        result = Regex.Replace(result, Regex.Escape(varName) + @"\s*\.", ".");
        result = Regex.Replace(result, @"UseUmbraco\(\)\s*\.", "UseUmbraco()\n    .");
        File.WriteAllText(path, result);
        return true;
    }

    // Extracts the content between the outer parentheses of .MethodName(...)
    private static string? ExtractCallBody(string source, string methodName)
    {
        var marker = $".{methodName}(";
        var start = source.IndexOf(marker, StringComparison.Ordinal);
        if (start < 0) return null;

        start += marker.Length;
        var depth = 1;
        var i = start;
        while (i < source.Length && depth > 0)
        {
            if (source[i] == '(') depth++;
            else if (source[i] == ')') depth--;
            i++;
        }

        return source[start..(i - 1)];
    }

    // Finds all Use*() calls in body that are not in the allowed list
    private static List<string> FindNonStandardCalls(string body, string[] allowed)
    {
        var allowedSet = new HashSet<string>(allowed, StringComparer.OrdinalIgnoreCase);
        return Regex.Matches(body, @"\b(Use\w+)\s*\(")
            .Select(m => m.Groups[1].Value)
            .Distinct()
            .Where(name => !allowedSet.Contains(name))
            .ToList();
    }
}

public record ProgramCsAuditResult
{
    public bool Found { get; init; }
    public bool UseUmbracoSavedToVariable { get; init; }
    public List<string> ExtraMiddleware { get; init; } = [];
    public List<string> ExtraEndpoints { get; init; } = [];
    public bool IsClean => Found && !UseUmbracoSavedToVariable
                                 && ExtraMiddleware.Count == 0
                                 && ExtraEndpoints.Count == 0;
}
