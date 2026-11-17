using System.Diagnostics;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Community.Sinners.Backend.Configuration;
using File = System.IO.File;
using IScopeProvider = Umbraco.Cms.Infrastructure.Scoping.IScopeProvider;

namespace Umbraco.Community.Sinners.Backend.Services;

/// <summary>
/// Commandment VIII: Umbraco is not your database. Two kinds of sinner, both found with one cheap SQL query each:
/// <list type="bullet">
/// <item>a <b>warehouse</b>: a parent with more than <see cref="SinnersSettings.ExodusChildThreshold"/> children of one
/// document type (form submissions, orders, log lines…)</item>
/// <item>a <b>log table</b>: a node with more than <see cref="SinnersSettings.ExodusVersionThreshold"/> versions (a counter or
/// a status field saved on every request)</item>
/// </list>
/// The Exodus exports them to JSON files in <see cref="SinnersSettings.ExodusPath"/> and takes them out of the tree:
/// warehouse children are deleted, a log table keeps only its current and published versions.
/// </summary>
public class ExodusService(
    IScopeProvider scopeProvider,
    ICoreScopeProvider coreScopeProvider,
    IContentService contentService,
    IContentTypeService contentTypeService,
    IOptionsMonitor<SinnersSettings> settings,
    IWebHostEnvironment env,
    ILogger<ExodusService> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    // NPoco maps result columns onto these by name
    private class WarehouseRow
    {
        public int ParentId { get; set; }
        public int ContentTypeId { get; set; }
        public int Total { get; set; }
    }

    private class VersionRow
    {
        public int NodeId { get; set; }
        public int Total { get; set; }
    }

    public int ChildThreshold => Math.Max(1, settings.CurrentValue.ExodusChildThreshold);
    public int VersionThreshold => Math.Max(1, settings.CurrentValue.ExodusVersionThreshold);

    /// <summary>Just the numbers, for the status endpoint: two grouped queries, no content loaded.</summary>
    public int CountSinners()
    {
        var (warehouses, logTables) = Query();
        return warehouses.Count + logTables.Count;
    }

    public ExodusAuditResult Audit()
    {
        var (warehouses, logTables) = Query();
        var sinners = new List<ExodusSinnerModel>();

        foreach (var w in warehouses)
        {
            var parent = w.ParentId > 0 ? contentService.GetById(w.ParentId) : null;
            var ct = contentTypeService.Get(w.ContentTypeId);
            sinners.Add(new ExodusSinnerModel
            {
                Kind = "warehouse",
                NodeKey = parent?.Key,
                Name = parent?.Name ?? "Content root",
                ContentTypeAlias = ct?.Alias ?? w.ContentTypeId.ToString(),
                ContentTypeName = ct?.Name ?? ct?.Alias ?? "?",
                Count = w.Total,
                Threshold = ChildThreshold,
            });
        }

        foreach (var l in logTables)
        {
            var node = contentService.GetById(l.NodeId);
            sinners.Add(new ExodusSinnerModel
            {
                Kind = "versions",
                NodeKey = node?.Key,
                Name = node?.Name ?? l.NodeId.ToString(),
                ContentTypeAlias = node?.ContentType.Alias ?? "?",
                ContentTypeName = node is null ? "?" : contentTypeService.Get(node.ContentTypeId)?.Name ?? node.ContentType.Alias,
                Count = l.Total,
                Threshold = VersionThreshold,
            });
        }

        return new ExodusAuditResult
        {
            ChildThreshold = ChildThreshold,
            VersionThreshold = VersionThreshold,
            ExportFolder = ExportFolderForDisplay,
            Sinners = sinners,
        };
    }

    public ExodusResult LeadThemOut()
    {
        var watch = Stopwatch.StartNew();
        var (warehouses, logTables) = Query();
        var folder = ExportFolder;
        Directory.CreateDirectory(folder);
        var files = new List<ExodusFileModel>();
        var deleted = 0;
        var pruned = 0;

        foreach (var w in warehouses)
        {
            var ct = contentTypeService.Get(w.ContentTypeId);
            var alias = ct?.Alias ?? $"type-{w.ContentTypeId}";

            // Everything of that type, then just the ones under this parent
            var children = new List<IContent>();
            const int pageSize = 1000;
            for (long page = 0; ; page++)
            {
                var batch = contentService.GetPagedOfType(w.ContentTypeId, page, pageSize, out var total, null!).ToList();
                children.AddRange(batch.Where(c => c.ParentId == w.ParentId && !c.Trashed));
                if ((page + 1) * pageSize >= total || batch.Count == 0) break;
            }
            if (children.Count == 0) continue;
            var loadedMs = watch.ElapsedMilliseconds;

            var parent = w.ParentId > 0 ? contentService.GetById(w.ParentId) : null;
            var fileName = UniqueFileName(folder, alias, ".json");
            var export = new
            {
                commandment = "VIII. Umbraco is not your database",
                exportedAt = DateTime.UtcNow,
                parent = parent is null ? null : new { key = parent.Key, name = parent.Name },
                contentType = alias,
                count = children.Count,
                nodes = children.OrderBy(c => c.SortOrder).Select(c => new
                {
                    key = c.Key,
                    name = c.Name,
                    createDate = c.CreateDate,
                    updateDate = c.UpdateDate,
                    published = c.Published,
                    properties = ExportProperties(c),
                }),
            };
            File.WriteAllText(Path.Combine(folder, fileName), JsonSerializer.Serialize(export, JsonOptions));

            var exportedMs = watch.ElapsedMilliseconds;

            // One ambient scope for the lot: one transaction, notifications and cache refreshes batched at the
            // end. (~10 ms a node on SQLite; IContentService.DeleteOfType measured slower: 8.3 s vs 6.5 s for 600.)
            using (var scope = coreScopeProvider.CreateCoreScope())
            {
                foreach (var child in children)
                {
                    contentService.Delete(child);
                    deleted++;
                }
                scope.Complete();
            }

            logger.LogInformation("Sinners Exodus: {Alias} loaded in {Load} ms, exported in {Export} ms, deleted in {Delete} ms",
                alias, loadedMs, exportedMs - loadedMs, watch.ElapsedMilliseconds - exportedMs);

            files.Add(new ExodusFileModel { File = fileName, Count = children.Count, Kind = "warehouse" });
        }

        foreach (var l in logTables)
        {
            var node = contentService.GetById(l.NodeId);
            if (node is null) continue;

            var versions = contentService.GetVersions(l.NodeId).OrderBy(v => v.VersionId).ToList();
            var fileName = UniqueFileName(folder, node.ContentType.Alias, ".versions.json");
            var export = new
            {
                commandment = "VIII. Umbraco is not your database",
                exportedAt = DateTime.UtcNow,
                node = new { key = node.Key, name = node.Name, contentType = node.ContentType.Alias },
                count = versions.Count,
                versions = versions.Select(v => new
                {
                    versionId = v.VersionId,
                    versionDate = v.UpdateDate,
                    name = v.Name,
                    properties = ExportProperties(v),
                }),
            };
            File.WriteAllText(Path.Combine(folder, fileName), JsonSerializer.Serialize(export, JsonOptions));

            // Keep the current draft and the published version, let the rest go
            var keep = new HashSet<int> { node.VersionId, node.PublishedVersionId };
            using (var scope = coreScopeProvider.CreateCoreScope())
            {
                foreach (var v in versions.Where(v => !keep.Contains(v.VersionId)))
                {
                    contentService.DeleteVersion(l.NodeId, v.VersionId, false);
                    pruned++;
                }
                scope.Complete();
            }

            files.Add(new ExodusFileModel { File = fileName, Count = versions.Count, Kind = "versions" });
        }

        logger.LogInformation("Sinners Exodus: {Deleted} nodes deleted, {Pruned} versions pruned, {Files} files in {Ms} ms",
            deleted, pruned, files.Count, watch.ElapsedMilliseconds);

        return new ExodusResult
        {
            Files = files,
            ExportFolder = ExportFolderForDisplay,
            DeletedNodes = deleted,
            PrunedVersions = pruned,
            ElapsedMs = watch.ElapsedMilliseconds,
        };
    }

    private (List<WarehouseRow> Warehouses, List<VersionRow> LogTables) Query()
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        var db = scope.Database;
        var document = Constants.ObjectTypes.Document;

        var warehouses = db.Fetch<WarehouseRow>(
            @"SELECT n.parentId AS ParentId, c.contentTypeId AS ContentTypeId, COUNT(*) AS Total
              FROM umbracoNode n
              INNER JOIN umbracoContent c ON c.nodeId = n.id
              WHERE n.nodeObjectType = @0 AND n.trashed = @1
              GROUP BY n.parentId, c.contentTypeId
              HAVING COUNT(*) > @2",
            document, false, ChildThreshold);

        var logTables = db.Fetch<VersionRow>(
            @"SELECT v.nodeId AS NodeId, COUNT(*) AS Total
              FROM umbracoContentVersion v
              INNER JOIN umbracoNode n ON n.id = v.nodeId
              WHERE n.nodeObjectType = @0 AND n.trashed = @1
              GROUP BY v.nodeId
              HAVING COUNT(*) > @2",
            document, false, VersionThreshold);

        return (warehouses, logTables);
    }

    private static Dictionary<string, object?> ExportProperties(IContent content)
    {
        var result = new Dictionary<string, object?>();
        foreach (var p in content.Properties)
        {
            if (p.Values.Count == 0) continue;
            if (p.Values.Count == 1 && p.Values.First().Culture is null && p.Values.First().Segment is null)
            {
                result[p.Alias] = p.Values.First().EditedValue;
                continue;
            }
            result[p.Alias] = p.Values.ToDictionary(
                v => $"{v.Culture ?? "invariant"}{(v.Segment is null ? "" : "/" + v.Segment)}",
                v => v.EditedValue);
        }
        return result;
    }

    private string ExportFolder
    {
        get
        {
            var configured = settings.CurrentValue.ExodusPath;
            if (string.IsNullOrWhiteSpace(configured)) configured = "umbraco/Data/sinners-exodus";
            return Path.IsPathRooted(configured) ? configured : Path.Combine(env.ContentRootPath, configured);
        }
    }

    private string ExportFolderForDisplay
    {
        get
        {
            var rel = Path.GetRelativePath(env.ContentRootPath, ExportFolder);
            return (rel.StartsWith("..") ? ExportFolder : rel).Replace('\\', '/');
        }
    }

    // A second exodus of the same type never overwrites the first one's export
    private static string UniqueFileName(string folder, string alias, string extension)
    {
        var name = alias + extension;
        for (var i = 2; File.Exists(Path.Combine(folder, name)); i++)
            name = $"{alias}-{i}{extension}";
        return name;
    }
}

public record ExodusAuditResult
{
    public required int ChildThreshold { get; init; }
    public required int VersionThreshold { get; init; }
    public required string ExportFolder { get; init; }
    public required IReadOnlyList<ExodusSinnerModel> Sinners { get; init; }
}

public record ExodusSinnerModel
{
    /// <summary>"warehouse" (Count = children of one type) or "versions" (Count = versions of one node).</summary>
    public required string Kind { get; init; }
    public Guid? NodeKey { get; init; }
    public required string Name { get; init; }
    public required string ContentTypeAlias { get; init; }
    public required string ContentTypeName { get; init; }
    public required int Count { get; init; }
    public required int Threshold { get; init; }
}

public record ExodusResult
{
    public required IReadOnlyList<ExodusFileModel> Files { get; init; }
    public required string ExportFolder { get; init; }
    public required int DeletedNodes { get; init; }
    public required int PrunedVersions { get; init; }
    public required long ElapsedMs { get; init; }
}

public record ExodusFileModel
{
    public required string File { get; init; }
    public required int Count { get; init; }
    public required string Kind { get; init; }
}
