using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Services;

public class ContentNotComposableService
{
    private static readonly HashSet<string> ComplexEditorAliases =
    [
        Constants.PropertyEditors.Aliases.BlockList,
        Constants.PropertyEditors.Aliases.BlockGrid,
        Constants.PropertyEditors.Aliases.RichText,
    ];

    private readonly IContentTypeService _contentTypeService;
    private readonly IContentTypeContainerService _containerService;
    private readonly BlessingService _blessingService;
    private readonly IScopeProvider _scopeProvider;

    public ContentNotComposableService(
        IContentTypeService contentTypeService,
        IContentTypeContainerService containerService,
        BlessingService blessingService,
        IScopeProvider scopeProvider)
    {
        _contentTypeService = contentTypeService;
        _containerService = containerService;
        _blessingService = blessingService;
        _scopeProvider = scopeProvider;
    }

    public async Task<bool> DeleteCompositionAsync(string alias)
    {
        var ct = _contentTypeService.Get(alias);
        if (ct is null) return false;
        await _contentTypeService.DeleteAsync(ct.Key, Constants.Security.SuperUserKey);
        return true;
    }

    public async Task<IEnumerable<EmptyCompositionModel>> GetEmptyCompositionsAsync()
    {
        HashSet<string> classifiedCompositions;
        using (var scope = _scopeProvider.CreateScope())
        {
            classifiedCompositions = scope.Database
                .Fetch<DocTypeClassificationDto>("WHERE Classification = @0", "Composition")
                .Select(d => d.ContentTypeAlias)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            scope.Complete();
        }

        if (classifiedCompositions.Count == 0)
            return [];

        var containers = (await _containerService.GetAllAsync())
            .ToDictionary(c => c.Id, c => c.Name ?? string.Empty);

        return _contentTypeService.GetAll()
            .Where(ct => classifiedCompositions.Contains(ct.Alias) && !ct.PropertyTypes.Any())
            .Select(ct => new EmptyCompositionModel
            {
                ContentTypeAlias = ct.Alias,
                ContentTypeName = ct.Name ?? ct.Alias,
                FolderPath = BuildFolderPath(ct.Path, containers),
            })
            .OrderBy(r => r.ContentTypeName);
    }

    public async Task<IEnumerable<SinfulCompositionModel>> GetSinfulCompositionsAsync()
    {
        var allTypes = _contentTypeService.GetAll().ToList();
        var containers = (await _containerService.GetAllAsync())
            .ToDictionary(c => c.Id, c => c.Name ?? string.Empty);
        var blessings = _blessingService.GetBlessings();

        var result = new List<SinfulCompositionModel>();

        foreach (var ct in allTypes)
        {
            var sinfulProps = ct.PropertyTypes
                .Where(p => ComplexEditorAliases.Contains(p.PropertyEditorAlias))
                .Select(p => new SinfulPropertyModel
                {
                    PropertyAlias = p.Alias,
                    PropertyName = p.Name ?? p.Alias,
                    EditorAlias = p.PropertyEditorAlias,
                    IsBlessed = blessings.Contains((ct.Alias, p.Alias)),
                })
                .ToList();

            if (sinfulProps.Count == 0) continue;

            var usedOn = _contentTypeService.GetComposedOf(ct.Id)
                .Select(c => c.Name ?? c.Alias)
                .ToList();

            if (usedOn.Count == 0) continue;

            result.Add(new SinfulCompositionModel
            {
                ContentTypeAlias = ct.Alias,
                ContentTypeName = ct.Name ?? ct.Alias,
                FolderPath = BuildFolderPath(ct.Path, containers),
                SinfulProperties = sinfulProps,
                UsedOn = usedOn,
            });
        }

        return result.OrderBy(r => r.ContentTypeName);
    }

    private static string BuildFolderPath(string entityPath, Dictionary<int, string> containers)
    {
        var ids = entityPath.Split(',')
            .Select(s => int.TryParse(s, out var id) ? id : -1)
            .Where(id => id > 0 && containers.ContainsKey(id));
        var segments = ids.Select(id => containers[id]).ToList();
        return segments.Count > 0 ? "/" + string.Join("/", segments) : "/";
    }
}

public record EmptyCompositionModel
{
    public required string ContentTypeAlias { get; init; }
    public required string ContentTypeName { get; init; }
    public required string FolderPath { get; init; }
}

public record SinfulCompositionModel
{
    public required string ContentTypeAlias { get; init; }
    public required string ContentTypeName { get; init; }
    public required string FolderPath { get; init; }
    public required IEnumerable<SinfulPropertyModel> SinfulProperties { get; init; }
    public required IEnumerable<string> UsedOn { get; init; }
}

public record SinfulPropertyModel
{
    public required string PropertyAlias { get; init; }
    public required string PropertyName { get; init; }
    public required string EditorAlias { get; init; }
    public bool IsBlessed { get; init; }
}
