using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace Umbraco.Community.Sinners.Backend.Services;

public class FoldInService(
    IContentTypeService contentTypeService,
    IContentService contentService,
    IDataTypeService dataTypeService,
    IShortStringHelper shortStringHelper,
    TypeWriteScope typeWriteScope)
{
    public async Task<FoldInResult> FoldInAsync(string compositionAlias, string propertyAlias)
    {
        var composition = contentTypeService.Get(compositionAlias);
        if (composition is null)
            return Fail($"Composition '{compositionAlias}' not found.");

        var sourceProperty = composition.PropertyTypes.FirstOrDefault(p => p.Alias == propertyAlias);
        if (sourceProperty is null)
            return Fail($"Property '{propertyAlias}' not found on '{compositionAlias}'.");

        var pageTypes = contentTypeService.GetComposedOf(composition.Id).ToList();
        if (pageTypes.Count == 0)
            return Fail("No doc types use this composition.");

        var dataType = await dataTypeService.GetAsync(sourceProperty.DataTypeKey);
        if (dataType is null)
            return Fail($"Data type for '{propertyAlias}' not found.");

        var tmpAlias = $"{propertyAlias}_fold_tmp";
        var (groupAlias, groupName, groupType) = FindPropertyGroup(composition, propertyAlias);

        // All four steps in one transaction that can't deadlock against Umbraco's content type cache
        // (TypeWriteScope says how it did). A step that fails leaves without Complete(): nothing is kept.
        using var scope = typeWriteScope.Begin();

        // Step 1: add {alias}_fold_tmp to every page doc type with the same data type
        foreach (var pageType in pageTypes)
        {
            var tmpProp = new PropertyType(shortStringHelper, dataType)
            {
                Alias = tmpAlias,
                Name = $"{sourceProperty.Name ?? propertyAlias} [fold]",
                // Everything else as the composition had it: after the fold the property reads the same
                // on the page type (description, validation, where it sits), only no longer inherited
                Description = sourceProperty.Description,
                SortOrder = sourceProperty.SortOrder,
                Mandatory = sourceProperty.Mandatory,
                MandatoryMessage = sourceProperty.MandatoryMessage,
                ValidationRegExp = sourceProperty.ValidationRegExp,
                ValidationRegExpMessage = sourceProperty.ValidationRegExpMessage,
                Variations = sourceProperty.Variations,
                LabelOnTop = sourceProperty.LabelOnTop,
            };
            pageType.AddPropertyType(tmpProp, groupAlias, groupName);
            // Match the composition's group type so Umbraco merges rather than rejects
            var group = pageType.PropertyGroups.FirstOrDefault(g => g.Alias == groupAlias);
            if (group is not null)
                group.Type = groupType;
            var added = await contentTypeService.UpdateAsync(pageType, Constants.Security.SuperUserKey);
            if (!added.Success)
                return Fail($"Could not add '{tmpAlias}' to '{pageType.Alias}': {added.Result}.");
        }

        // Step 2: copy existing content values → {alias}_fold_tmp for every node of each page type
        var totalCopied = 0;
        foreach (var pageType in pageTypes)
        {
            // null! is safe: the implementation accepts null even though the interface signature omits ?
            var allContent = contentService.GetPagedOfType(pageType.Id, 0, 10_000, out _, null!);
            foreach (var content in allContent)
            {
                foreach (var culture in GetRelevantCultures(content, propertyAlias))
                {
                    var value = content.GetValue(propertyAlias, culture);
                    if (value is not null)
                        content.SetValue(tmpAlias, value, culture);
                }
                var saved = contentService.Save(content);
                if (!saved.Success)
                    return Fail($"Could not copy '{propertyAlias}' on '{content.Name}': {saved.Result}.");
                totalCopied++;
            }
        }

        // Step 3: remove the property from the composition (Umbraco will clean up the old property data)
        composition.RemovePropertyType(propertyAlias);
        var removed = await contentTypeService.UpdateAsync(composition, Constants.Security.SuperUserKey);
        if (!removed.Success)
            return Fail($"Could not remove '{propertyAlias}' from '{compositionAlias}': {removed.Result}.");

        // Step 4: rename {alias}_fold_tmp → {alias} on each page type
        //         (only the alias changes; the property type ID and its data stay intact)
        foreach (var pageType in pageTypes)
        {
            var reloaded = contentTypeService.Get(pageType.Id)!;
            var tmpPropType = reloaded.PropertyTypes.FirstOrDefault(p => p.Alias == tmpAlias);
            if (tmpPropType is not null)
            {
                tmpPropType.Alias = propertyAlias;
                tmpPropType.Name = sourceProperty.Name ?? propertyAlias;
                var renamed = await contentTypeService.UpdateAsync(reloaded, Constants.Security.SuperUserKey);
                if (!renamed.Success)
                    return Fail($"Could not rename '{tmpAlias}' on '{reloaded.Alias}': {renamed.Result}.");
            }
        }

        scope.Complete();

        return new FoldInResult
        {
            Success = true,
            Message = $"Folded '{propertyAlias}' into {pageTypes.Count} doc type(s), updated {totalCopied} content item(s).",
            AffectedDocTypeCount = pageTypes.Count,
            AffectedContentCount = totalCopied,
        };
    }

    private static (string alias, string name, PropertyGroupType type) FindPropertyGroup(IContentType contentType, string propertyAlias)
    {
        var group = contentType.PropertyGroups
            .FirstOrDefault(g => g.PropertyTypes?.Any(p => p.Alias == propertyAlias) == true);
        return (group?.Alias ?? "content", group?.Name ?? "Content", group?.Type ?? PropertyGroupType.Group);
    }

    private static string?[] GetRelevantCultures(IContent content, string propertyAlias)
    {
        var prop = content.Properties.FirstOrDefault(p => p.Alias == propertyAlias);
        if (prop is null) return [null];
        var cultures = prop.Values.Select(v => v.Culture).Distinct().ToArray();
        return cultures.Length > 0 ? cultures : [null];
    }

    private static FoldInResult Fail(string message) =>
        new() { Success = false, Message = message };
}

public record FoldInResult
{
    public required bool Success { get; init; }
    public required string Message { get; init; }
    public int AffectedDocTypeCount { get; init; }
    public int AffectedContentCount { get; init; }
}
