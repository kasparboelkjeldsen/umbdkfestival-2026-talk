using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Services;

public class DocTypeClassificationService
{
    private readonly IScopeProvider _scopeProvider;
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentTypeContainerService _containerService;

    public DocTypeClassificationService(
        IScopeProvider scopeProvider,
        IContentTypeService contentTypeService,
        IContentTypeContainerService containerService)
    {
        _scopeProvider = scopeProvider;
        _contentTypeService = contentTypeService;
        _containerService = containerService;
    }

    public async Task<IEnumerable<ContentTypeClassificationModel>> GetAllWithClassification()
    {
        using var scope = _scopeProvider.CreateScope();

        var classifications = scope.Database
            .Fetch<DocTypeClassificationDto>()
            .ToDictionary(c => c.ContentTypeAlias);

        scope.Complete();

        var allContainers = await _containerService.GetAllAsync();
        var containers = allContainers.ToDictionary(c => c.Id, c => c.Name ?? string.Empty);

        return _contentTypeService.GetAll()
            .Select(ct =>
            {
                var folderPath = BuildFolderPath(ct.Path, containers);
                var existingClassification = classifications.TryGetValue(ct.Alias, out var c) ? c.Classification : null;
                // Legacy classifications (Repository/RepositoryItem) from before the Library era
                // are treated as unclassified so they resurface for re-confession.
                if (existingClassification is not null && !RootFolderByClassification.ContainsKey(existingClassification))
                    existingClassification = null;
                return new ContentTypeClassificationModel
                {
                    ContentTypeAlias = ct.Alias,
                    ContentTypeName = ct.Name ?? ct.Alias,
                    IsElement = ct.IsElement,
                    Classification = existingClassification,
                    FolderPath = folderPath,
                    SuggestedClassification = existingClassification is null ? SuggestFromPath(folderPath) : null,
                };
            })
            .OrderBy(x => x.FolderPath)
            .ThenBy(x => x.ContentTypeName);
    }

    public void SetClassification(string contentTypeAlias, string classification)
    {
        using var scope = _scopeProvider.CreateScope();

        var existing = scope.Database.SingleOrDefault<DocTypeClassificationDto>(
            "WHERE ContentTypeAlias = @0", contentTypeAlias);

        if (existing is null)
        {
            scope.Database.Insert(new DocTypeClassificationDto
            {
                ContentTypeAlias = contentTypeAlias,
                Classification = classification,
                CreatedUtc = DateTime.UtcNow,
                UpdatedUtc = DateTime.UtcNow,
            });
        }
        else
        {
            existing.Classification = classification;
            existing.UpdatedUtc = DateTime.UtcNow;
            scope.Database.Update(existing);
        }

        scope.Complete();
    }

    private static string BuildFolderPath(string entityPath, Dictionary<int, string> containers)
    {
        var ids = entityPath.Split(',')
            .Select(s => int.TryParse(s, out var id) ? id : -1)
            .Where(id => id > 0 && containers.ContainsKey(id));

        var segments = ids.Select(id => containers[id]).ToList();
        return segments.Count > 0 ? "/" + string.Join("/", segments) : "/";
    }

    // The Four Sacred Types. Repository/RepositoryItem ascended to the Library in Umbraco 18 —
    // shared content is now Library elements, so those classifications no longer exist.
    private static readonly Dictionary<string, string> RootFolderByClassification = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Page"] = "Pages",
        ["Block"] = "Blocks",
        ["Data"] = "Data",
        ["Composition"] = "Compositions",
    };

    public async Task AutoCategorizeAsync()
    {
        var classified = (await GetAllWithClassification())
            .Where(ct => ct.Classification is not null)
            .ToList();

        var allContainers = (await _containerService.GetAllAsync()).ToList();
        var containerLookup = allContainers
            .ToDictionary(c => (c.ParentId, Name: c.Name?.ToLowerInvariant() ?? string.Empty));

        foreach (var item in classified)
        {
            if (!RootFolderByClassification.TryGetValue(item.Classification!, out var expectedRoot))
                continue;
            var currentSegments = item.FolderPath.Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (currentSegments.Length > 0 &&
                string.Equals(currentSegments[0], expectedRoot, StringComparison.OrdinalIgnoreCase))
                continue;

            string[] targetSegments = currentSegments.Length == 0
                ? [expectedRoot]
                : [expectedRoot, ..currentSegments];

            int parentId = -1;
            Guid? parentKey = null;

            foreach (var segment in targetSegments)
            {
                var lookupKey = (parentId, segment.ToLowerInvariant());
                if (!containerLookup.TryGetValue(lookupKey, out var container))
                {
                    var attempt = await _containerService.CreateAsync(null, segment, parentKey, Constants.Security.SuperUserKey);
                    if (!attempt.Success) goto nextItem;
                    container = attempt.Result!;
                    containerLookup[lookupKey] = container;
                    allContainers.Add(container);
                }
                parentId = container.Id;
                parentKey = container.Key;
            }

            var contentType = _contentTypeService.Get(item.ContentTypeAlias);
            if (contentType is not null)
                await _contentTypeService.MoveAsync(contentType.Key, parentKey);

            nextItem:;
        }

        await DeleteEmptiedRootFoldersAsync();
    }

    /// <summary>
    /// After the moves, the old top-level folders (Elements, …) are left with nothing in them: delete
    /// every top-level folder that isn't one of the four roots and has no document type at any depth.
    /// A folder can only be deleted once it's empty, so its subfolders go first, deepest first.
    /// </summary>
    private async Task DeleteEmptiedRootFoldersAsync()
    {
        var containers = (await _containerService.GetAllAsync()).ToList();
        var children = containers.ToLookup(c => c.ParentId);
        var holdsTypes = _contentTypeService.GetAll().Select(ct => ct.ParentId).ToHashSet();
        var roots = RootFolderByClassification.Values.ToHashSet(StringComparer.OrdinalIgnoreCase);

        bool IsEmpty(Umbraco.Cms.Core.Models.EntityContainer c) =>
            !holdsTypes.Contains(c.Id) && children[c.Id].All(IsEmpty);

        async Task DeleteTreeAsync(Umbraco.Cms.Core.Models.EntityContainer c)
        {
            foreach (var child in children[c.Id]) await DeleteTreeAsync(child);
            await _containerService.DeleteAsync(c.Key, Constants.Security.SuperUserKey);
        }

        foreach (var top in children[-1].Where(c => !roots.Contains(c.Name ?? string.Empty) && IsEmpty(c)).ToList())
            await DeleteTreeAsync(top);
    }

    private static string? SuggestFromPath(string path)
    {
        var lower = path.ToLowerInvariant();

        if (Contains(lower, "composition", "compositions", "compose", "composed"))
            return "Composition";
        if (Contains(lower, "page", "pages"))
            return "Page";
        if (Contains(lower, "block", "blocks"))
            return "Block";
        if (Contains(lower, "data"))
            return "Data";

        return null;
    }

    private static bool Contains(string path, params string[] keywords) =>
        keywords.Any(kw => path.Split('/').Any(segment => segment.Equals(kw, StringComparison.OrdinalIgnoreCase)));
}

public record ContentTypeClassificationModel
{
    public required string ContentTypeAlias { get; init; }
    public required string ContentTypeName { get; init; }
    public required bool IsElement { get; init; }
    public string? Classification { get; init; }
    public required string FolderPath { get; init; }
    public string? SuggestedClassification { get; init; }
}
