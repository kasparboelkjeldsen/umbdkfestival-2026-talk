using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;

namespace Umbraco.Community.Sinners.Backend.Services;

public class USyncAuditService(IWebHostEnvironment env, PenanceStateStore stateStore)
{
    private static readonly Regex USyncRef = new(
        @"<PackageReference[^>]+Include=""uSync""",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex DeployRef = new(
        @"<PackageReference[^>]+Include=""Umbraco\.Deploy",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public USyncAuditResult Audit()
    {
        var csprojFiles = Directory.GetFiles(env.ContentRootPath, "*.csproj");
        if (csprojFiles.Length == 0)
            return new USyncAuditResult { CsprojFound = false, HasUSync = false, HasUmbracoDeploy = false, CsprojName = null };

        var path = csprojFiles[0];
        var content = File.ReadAllText(path);
        var hasUSync = USyncRef.IsMatch(content);

        return new USyncAuditResult
        {
            CsprojFound = true,
            CsprojName = Path.GetFileName(path),
            HasUSync = hasUSync,
            HasUmbracoDeploy = DeployRef.IsMatch(content),
            Pretended = hasUSync && stateStore.Read().PretendedUSync,
        };
    }

    public bool InjectUSync()
    {
        var csprojFiles = Directory.GetFiles(env.ContentRootPath, "*.csproj");
        if (csprojFiles.Length == 0) return false;

        var path = csprojFiles[0];
        var content = File.ReadAllText(path);
        if (USyncRef.IsMatch(content)) return true;

        // Under Central Package Management a versioned PackageReference is an error (NU1008):
        // the version belongs in Directory.Packages.props, the reference stays versionless.
        var propsPath = Path.Combine(env.ContentRootPath, "Directory.Packages.props");
        var usesCpm = File.Exists(propsPath);

        var packageRef = usesCpm
            ? "    <PackageReference Include=\"uSync\" />\n"
            : "    <PackageReference Include=\"uSync\" Version=\"18.1.2\" />\n";
        var injection = "  <ItemGroup>\n" + packageRef + "  </ItemGroup>\n";
        var updated = content.Replace("</Project>", injection + "</Project>");
        File.WriteAllText(path, updated);
        stateStore.Update(s => s.PretendedUSync = true);

        if (usesCpm)
        {
            var props = File.ReadAllText(propsPath);
            if (!Regex.IsMatch(props, @"<PackageVersion[^>]+Include=""uSync""", RegexOptions.IgnoreCase))
            {
                var versionLine = "    <PackageVersion Include=\"uSync\" Version=\"18.1.2\" />\n";
                var idx = props.IndexOf("</ItemGroup>", StringComparison.OrdinalIgnoreCase);
                var updatedProps = idx >= 0
                    ? props.Insert(idx, versionLine + "  ")
                    : props.Replace("</Project>", "  <ItemGroup>\n" + versionLine + "  </ItemGroup>\n</Project>");
                File.WriteAllText(propsPath, updatedProps);
            }
        }

        return true;
    }
}

public record USyncAuditResult
{
    public required bool CsprojFound { get; init; }
    public required bool HasUSync { get; init; }
    public required bool HasUmbracoDeploy { get; init; }
    public required string? CsprojName { get; init; }

    /// <summary>uSync is in the csproj because the ✨ button put it there: nobody restored, built or ran it.</summary>
    public bool Pretended { get; init; }
}
