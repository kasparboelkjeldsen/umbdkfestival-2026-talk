using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
namespace Umbraco.Community.Sinners.Backend.Services;

public class ProductionReadinessService(IWebHostEnvironment env, BlessingStore blessingStore)
{
    private record RequiredSetting(string Key, string ExpectedValue, Func<string, bool> Validate);

    private static readonly RequiredSetting[] Settings =
    [
        new("Umbraco:CMS:Runtime:Mode",
            "Production",
            v => string.Equals(v, "Production", StringComparison.OrdinalIgnoreCase)),

        new("Umbraco:CMS:Hosting:Debug",
            "false",
            v => string.Equals(v, "false", StringComparison.OrdinalIgnoreCase)),

        new("Umbraco:CMS:Global:UseHttps",
            "true",
            v => string.Equals(v, "true", StringComparison.OrdinalIgnoreCase)),

        new("Umbraco:CMS:ModelsBuilder:ModelsMode",
            "Nothing",
            v => string.Equals(v, "Nothing", StringComparison.OrdinalIgnoreCase)),

        new("Umbraco:CMS:WebRouting:UmbracoApplicationUrl",
            "https://<your-domain>/",
            v => !string.IsNullOrWhiteSpace(v)
                 && !v.Contains("<REPLACE", StringComparison.OrdinalIgnoreCase)
                 && Uri.TryCreate(v, UriKind.Absolute, out var uri)
                 && (uri.Scheme == "https" || uri.Scheme == "http")),
    ];

    public HashSet<string> GetBlessedSettings() => blessingStore.GetBlessed(BlessingKind.ProductionSetting);

    public void SetSettingBlessed(string settingKey, bool blessed) =>
        blessingStore.SetBlessed(BlessingKind.ProductionSetting, settingKey, blessed);

    public ProductionReadinessResult Audit()
    {
        var blessed = GetBlessedSettings();
        var files = Directory.GetFiles(env.ContentRootPath, "appsettings*.json")
            .Select(Path.GetFileName)
            .OfType<string>()
            .Where(f => !f.StartsWith("appsettings-schema", StringComparison.OrdinalIgnoreCase))
            .OrderBy(f => f)
            .ToList();

        var covered = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var fileName in files)
        {
            var fullPath = Path.Combine(env.ContentRootPath, fileName);
            try
            {
                using var stream = File.OpenRead(fullPath);
                using var doc = JsonDocument.Parse(stream);

                foreach (var setting in Settings)
                {
                    if (covered.Contains(setting.Key)) continue;
                    if (TryExtractValue(doc.RootElement, setting.Key, out var value)
                        && setting.Validate(value))
                        covered.Add(setting.Key);
                }
            }
            catch { /* skip malformed files */ }
        }

        var missing = Settings
            .Where(s => !covered.Contains(s.Key))
            .Select(s => new MissingProductionSetting
            {
                Key = s.Key,
                ExpectedValue = s.ExpectedValue,
                IsBlessed = blessed.Contains(s.Key),
            })
            .ToList();

        return new ProductionReadinessResult
        {
            IsReady = missing.All(s => s.IsBlessed),
            ScannedFiles = files,
            MissingSettings = missing,
        };
    }

    // Navigates a colon-delimited config path through nested JSON objects
    private static bool TryExtractValue(JsonElement root, string path, out string value)
    {
        value = string.Empty;
        var current = root;

        foreach (var segment in path.Split(':'))
        {
            if (current.ValueKind != JsonValueKind.Object
                || !current.TryGetProperty(segment, out current))
                return false;
        }

        value = current.ValueKind switch
        {
            JsonValueKind.String => current.GetString() ?? string.Empty,
            JsonValueKind.True   => "true",
            JsonValueKind.False  => "false",
            _                   => current.GetRawText(),
        };
        return true;
    }
}

public record ProductionReadinessResult
{
    public required bool IsReady { get; init; }
    public required List<string> ScannedFiles { get; init; }
    public required List<MissingProductionSetting> MissingSettings { get; init; }
}

public record MissingProductionSetting
{
    public required string Key { get; init; }
    public required string ExpectedValue { get; init; }
    public bool IsBlessed { get; init; }
}
