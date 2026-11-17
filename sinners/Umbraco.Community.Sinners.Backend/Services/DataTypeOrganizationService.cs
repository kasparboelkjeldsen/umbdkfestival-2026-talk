using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.Sinners.Backend.Configuration;

namespace Umbraco.Community.Sinners.Backend.Services;

public class DataTypeOrganizationService(
    IDataTypeService dataTypeService,
    IDataTypeContainerService containerService,
    IOptions<SinnersSettings> settings)
{
    private string CustomPrefix =>
        string.IsNullOrWhiteSpace(settings.Value.DatatypePrefix) ? "Custom" : settings.Value.DatatypePrefix;

    public async Task<IEnumerable<UnorganizedDataTypeModel>> GetUnorganizedAsync()
    {
        var all = await dataTypeService.GetAllAsync();
        var prefix = CustomPrefix;

        return all
            .Where(dt => dt.ParentId == -1)
            .Select(dt => new UnorganizedDataTypeModel
            {
                Key = dt.Key,
                Name = dt.Name ?? string.Empty,
                EditorAlias = dt.EditorAlias,
                IsBuiltIn = dt.Id < 0,
                TargetFolder = dt.Id < 0
                    ? $"/Umbraco/{dt.EditorAlias}"
                    : $"/{prefix}/{dt.EditorAlias}",
            })
            .OrderBy(dt => dt.TargetFolder)
            .ThenBy(dt => dt.Name);
    }

    public async Task<int> OrganizeAllAsync()
    {
        var unorganized = (await GetUnorganizedAsync()).ToList();
        if (unorganized.Count == 0) return 0;

        var prefix = CustomPrefix;
        var allContainers = (await containerService.GetAllAsync()).ToList();
        var containerLookup = allContainers
            .ToDictionary(c => (c.ParentId, Name: c.Name?.ToLowerInvariant() ?? string.Empty));

        var organized = 0;
        foreach (var item in unorganized)
        {
            var rootName = item.IsBuiltIn ? "Umbraco" : prefix;
            var folderKey = await EnsureFolderPathAsync(
                [rootName, item.EditorAlias],
                containerLookup,
                allContainers);

            var dataType = await dataTypeService.GetAsync(item.Key);
            if (dataType is null) continue;

            await dataTypeService.MoveAsync(dataType, folderKey, Constants.Security.SuperUserKey);
            organized++;
        }

        return organized;
    }

    private async Task<Guid> EnsureFolderPathAsync(
        string[] segments,
        Dictionary<(int ParentId, string Name), EntityContainer> lookup,
        List<EntityContainer> allContainers)
    {
        var parentId = -1;
        Guid? parentKey = null;

        foreach (var segment in segments)
        {
            var key = (parentId, segment.ToLowerInvariant());
            if (!lookup.TryGetValue(key, out var container))
            {
                var attempt = await containerService.CreateAsync(null, segment, parentKey, Constants.Security.SuperUserKey);
                if (!attempt.Success)
                    throw new InvalidOperationException($"Failed to create data type folder '{segment}'.");
                container = attempt.Result!;
                lookup[key] = container;
                allContainers.Add(container);
            }
            parentId = container.Id;
            parentKey = container.Key;
        }

        return parentKey!.Value;
    }
}

public record UnorganizedDataTypeModel
{
    public required Guid Key { get; init; }
    public required string Name { get; init; }
    public required string EditorAlias { get; init; }
    public required bool IsBuiltIn { get; init; }
    public required string TargetFolder { get; init; }
}
