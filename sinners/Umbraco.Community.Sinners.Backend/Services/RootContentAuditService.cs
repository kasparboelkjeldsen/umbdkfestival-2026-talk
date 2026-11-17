using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Services;

// Rule IX (Library era): the root must not be a renderable piece of content.
// Shared content lives in the Library now, so root nodes no longer need to be Repositories —
// but a root node with a template still rendereth, and a Root that Rendereth is an Abomination.
public class RootContentAuditService(
    IContentService contentService,
    IContentTypeService contentTypeService,
    IContentTypeContainerService containerService,
    IScopeProvider scopeProvider,
    IShortStringHelper shortStringHelper,
    IDomainService domainService,
    ILanguageService languageService,
    ILogger<RootContentAuditService> logger)
{
    public Task<RootContentAuditResult> AuditAsync()
    {
        var rootNodes = contentService.GetRootContent().ToList();
        var contentTypes = new Dictionary<string, IContentType?>(StringComparer.OrdinalIgnoreCase);

        var nodeModels = rootNodes.Select(n =>
        {
            if (!contentTypes.TryGetValue(n.ContentType.Alias, out var ct))
                contentTypes[n.ContentType.Alias] = ct = contentTypeService.Get(n.ContentType.Alias);

            // Umbraco 18 removed per-document template assignment (IContent.TemplateId is gone) —
            // renderability is decided entirely by the content type's templates.
            var allowedTemplates = ct?.AllowedTemplates?.ToList() ?? [];
            var hasTemplate = ct?.DefaultTemplate is not null || allowedTemplates.Count > 0;
            var templateAlias = ct?.DefaultTemplate?.Alias ?? allowedTemplates.FirstOrDefault()?.Alias;

            return new RootNodeModel
            {
                Key = n.Key,
                Name = n.Name ?? n.Key.ToString(),
                ContentTypeAlias = n.ContentType.Alias,
                ContentTypeName = ct?.Name ?? n.ContentType.Alias,
                HasTemplate = hasTemplate,
                TemplateAlias = templateAlias,
            };
        }).ToList();

        return Task.FromResult(new RootContentAuditResult
        {
            IsClean = nodeModels.All(n => !n.HasTemplate),
            RootNodes = nodeModels,
        });
    }

    public async Task<RootSanctuaryResult> SeekSanctuaryAsync()
    {
        var rootNodes = contentService.GetRootContent().ToList();
        if (rootNodes.Count == 0)
            return new RootSanctuaryResult { Success = true, Message = "Thy content tree is empty — no sanctuary is needed at this time." };

        // Collect the renderable (template-bearing) content types currently at root
        var audit = await AuditAsync();
        var sinfulAliases = audit.RootNodes
            .Where(n => n.HasTemplate)
            .Select(n => n.ContentTypeAlias)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var sinfulContentTypes = sinfulAliases
            .Select(alias => contentTypeService.Get(alias))
            .Where(ct => ct is not null)
            .Cast<IContentType>()
            .ToList();

        // Step 1: Ensure the "Pages" root folder and its "Roots" subfolder exist
        var allContainers = (await containerService.GetAllAsync()).ToList();

        var pagesContainer = allContainers.FirstOrDefault(c =>
            c.ParentId == -1 &&
            string.Equals(c.Name, "Pages", StringComparison.OrdinalIgnoreCase));

        Guid pagesKey;
        int pagesId;
        if (pagesContainer is null)
        {
            var attempt = await containerService.CreateAsync(null, "Pages", null, Constants.Security.SuperUserKey);
            if (!attempt.Success)
                return new RootSanctuaryResult { Success = false, Message = "The 'Pages' folder could not be created. Seek forgiveness elsewhere." };
            pagesKey = attempt.Result!.Key;
            pagesId = attempt.Result!.Id;
        }
        else
        {
            pagesKey = pagesContainer.Key;
            pagesId = pagesContainer.Id;
        }

        var rootsContainer = allContainers.FirstOrDefault(c =>
            c.ParentId == pagesId &&
            string.Equals(c.Name, "Roots", StringComparison.OrdinalIgnoreCase));

        Guid rootsKey;
        if (rootsContainer is null)
        {
            var attempt = await containerService.CreateAsync(null, "Roots", pagesKey, Constants.Security.SuperUserKey);
            if (!attempt.Success)
                return new RootSanctuaryResult { Success = false, Message = "The 'Pages/Roots' folder could not be created. Seek forgiveness elsewhere." };
            rootsKey = attempt.Result!.Key;
        }
        else
        {
            rootsKey = rootsContainer.Key;
        }

        // Step 2: Create the SiteRoot content type (templateless by nature), or update the existing one
        var siteRoot = contentTypeService.Get("siteRoot");
        if (siteRoot is null)
        {
            var newType = new ContentType(shortStringHelper, -1)
            {
                Alias = "siteRoot",
                Name = "SiteRoot",
                Icon = "icon-globe",
                AllowedAsRoot = true,
                IsElement = false,
                AllowedContentTypes = sinfulContentTypes
                    .Select((ct, i) => new ContentTypeSort(ct.Key, i, ct.Alias))
                    .ToArray(),
            };
            // Save() was removed in Umbraco 18 — CreateAsync is the one true path
            var createAttempt = await contentTypeService.CreateAsync(newType, Constants.Security.SuperUserKey);
            if (!createAttempt.Success)
                return new RootSanctuaryResult { Success = false, Message = $"The SiteRoot content type could not be created ({createAttempt.Result}). Seek forgiveness elsewhere." };
            siteRoot = newType;
            await contentTypeService.MoveAsync(siteRoot.Key, rootsKey);
        }
        else
        {
            var currentAllowed = (siteRoot.AllowedContentTypes ?? []).ToList();
            var currentKeys = currentAllowed.Select(a => a.Key).ToHashSet();
            var toAdd = sinfulContentTypes.Where(ct => !currentKeys.Contains(ct.Key)).ToList();
            if (toAdd.Count > 0 || !siteRoot.AllowedAsRoot)
            {
                siteRoot.AllowedAsRoot = true;
                siteRoot.AllowedContentTypes = currentAllowed
                    .Concat(toAdd.Select((ct, i) => new ContentTypeSort(ct.Key, currentAllowed.Count + i, ct.Alias)))
                    .ToArray();
                await contentTypeService.UpdateAsync(siteRoot, Constants.Security.SuperUserKey);
            }
        }

        // Step 3: Classify SiteRoot as a Page in our table (it dwells under Pages/Roots)
        using var scope = scopeProvider.CreateScope();
        var existingClass = scope.Database.SingleOrDefault<DocTypeClassificationDto>(
            "WHERE ContentTypeAlias = @0", "siteRoot");
        if (existingClass is null)
            scope.Database.Insert(new DocTypeClassificationDto
            {
                ContentTypeAlias = "siteRoot",
                Classification = "Page",
                CreatedUtc = DateTime.UtcNow,
                UpdatedUtc = DateTime.UtcNow,
            });
        else if (!string.Equals(existingClass.Classification, "Page", StringComparison.OrdinalIgnoreCase))
        {
            existingClass.Classification = "Page";
            existingClass.UpdatedUtc = DateTime.UtcNow;
            scope.Database.Update(existingClass);
        }
        scope.Complete();

        // Step 4: Strip AllowedAsRoot from the sinful content types
        foreach (var ct in sinfulContentTypes)
        {
            if (ct.AllowedAsRoot)
            {
                ct.AllowedAsRoot = false;
                await contentTypeService.UpdateAsync(ct, Constants.Security.SuperUserKey);
            }
        }

        // Step 5: Give every rendering root its own sanctuary node (one SiteRoot per site) and lead it in
        var sinners = rootNodes
            .Where(n => audit.RootNodes.Any(a => a.Key == n.Key && a.HasTemplate))
            .OrderBy(n => n.SortOrder)
            .ToList();
        if (sinners.Count == 0)
            return new RootSanctuaryResult { Success = true, Message = "No root node beareth a template. SiteRoot stands ready in Pages/Roots should one ever stray." };

        // A site without hostnames is found by being the first root. Once it moves down a level it needs a
        // relative domain ("/", any host) to keep answering at the site's root, as it did before.
        var hasHostnames = (await domainService.GetAllAsync(false)).Any();
        var defaultIsoCode = await languageService.GetDefaultIsoCodeAsync();

        var newRootOrder = rootNodes.OrderBy(n => n.SortOrder).ToList();
        var moved = new List<string>();
        foreach (var node in sinners)
        {
            var sanctuaryName = sinners.Count == 1 ? "Site" : $"Site: {node.Name}";
            var sanctuary = rootNodes.FirstOrDefault(n =>
                                n.ContentType.Alias == siteRoot.Alias && n.Name == sanctuaryName)
                            ?? contentService.Create(sanctuaryName, Constants.System.Root, siteRoot);
            if (!sanctuary.Published)
            {
                contentService.Save(sanctuary);
                var publish = contentService.Publish(sanctuary, ["*"]);
                if (!publish.Success)
                    return new RootSanctuaryResult { Success = false, Message = $"The sanctuary '{sanctuaryName}' could not be consecrated ({publish.Result}). Seek forgiveness elsewhere." };
            }

            var wasPublished = node.Published;
            var move = contentService.Move(node, sanctuary.Id, Constants.Security.SuperUserId);
            if (!move.Success)
                return new RootSanctuaryResult { Success = false, Message = $"'{node.Name}' would not be led into its sanctuary ({move.Result}). Seek forgiveness elsewhere." };
            if (wasPublished && contentService.GetById(node.Key) is { Published: false } stray)
                contentService.Publish(stray, ["*"]);

            newRootOrder.RemoveAll(n => n.Key == sanctuary.Key);
            newRootOrder[newRootOrder.FindIndex(n => n.Key == node.Key)] = sanctuary;

            if (!hasHostnames && moved.Count == 0)
                await KeepAnsweringAtTheRootAsync(node, defaultIsoCode);
            moved.Add(node.Name ?? node.Key.ToString());
        }

        // The sanctuaries take the places their sites left
        contentService.Sort(newRootOrder, Constants.Security.SuperUserId);

        var names = moved.Count == 1 ? $"'{moved[0]}' now dwelleth" : $"{string.Join(", ", moved.Select(m => $"'{m}'"))} now dwell";
        return new RootSanctuaryResult
        {
            Success = true,
            Message = $"Thy sanctuary is built. {names} beneath a templateless SiteRoot, still published, still answering where it did. The root no longer rendereth.",
        };
    }

    private async Task KeepAnsweringAtTheRootAsync(IContent node, string defaultIsoCode)
    {
        var assigned = (await domainService.GetAssignedDomainsAsync(node.Key, true)).ToList();
        var wildcard = assigned.FirstOrDefault(d => d.IsWildcard);
        var result = await domainService.UpdateDomainsAsync(node.Key, new DomainsUpdateModel
        {
            DefaultIsoCode = wildcard?.LanguageIsoCode,
            Domains = [new DomainModel { DomainName = "/", IsoCode = wildcard?.LanguageIsoCode ?? defaultIsoCode }],
        });
        if (!result.Success)
            logger.LogWarning("Sinners IX: could not give {Node} the relative domain '/' ({Status}); it answers at its own path now", node.Name, result.Status);
    }
}

public record RootContentAuditResult
{
    public required bool IsClean { get; init; }
    public required IReadOnlyList<RootNodeModel> RootNodes { get; init; }
}

public record RootNodeModel
{
    public required Guid Key { get; init; }
    public required string Name { get; init; }
    public required string ContentTypeAlias { get; init; }
    public required string ContentTypeName { get; init; }
    public required bool HasTemplate { get; init; }
    public string? TemplateAlias { get; init; }
}

public record RootSanctuaryResult
{
    public required bool Success { get; init; }
    public required string Message { get; init; }
}
