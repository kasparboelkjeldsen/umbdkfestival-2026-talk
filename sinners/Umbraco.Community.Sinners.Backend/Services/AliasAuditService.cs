using System.Text.RegularExpressions;
using Umbraco.Cms.Core.Services;
using WeCantSpell.Hunspell;

namespace Umbraco.Community.Sinners.Backend.Services;

public class AliasAuditService
{

    private static readonly Regex CamelCaseRegex = new(@"^[a-z][a-zA-Z0-9]*$", RegexOptions.Compiled);

    // Splits on lowercase→uppercase transitions and on runs of uppercase followed by lowercase
    private static readonly Regex SplitRegex = new(
        @"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])",
        RegexOptions.Compiled);

    private readonly IContentTypeService _contentTypeService;
    private readonly IContentTypeContainerService _containerService;
    private readonly BlessingStore _blessingStore;

    public AliasAuditService(
        IContentTypeService contentTypeService,
        IContentTypeContainerService containerService,
        BlessingStore blessingStore)
    {
        _contentTypeService = contentTypeService;
        _containerService = containerService;
        _blessingStore = blessingStore;
    }

    public async Task<IEnumerable<AliasIssueModel>> GetAliasIssuesAsync()
    {
        var allTypes = _contentTypeService.GetAll().ToList();
        var containers = (await _containerService.GetAllAsync())
            .ToDictionary(c => c.Id, c => c.Name ?? string.Empty);
        var blessed = GetBlessedAliases();
        var wordList = HunspellDictionary.EnUs;
        var results = new List<AliasIssueModel>();

        foreach (var ct in allTypes)
        {
            var alias = ct.Alias;
            var isCamelCase = CamelCaseRegex.IsMatch(alias);
            var unrecognized = FindUnrecognizedWords(alias, wordList);
            var isBlessed = blessed.Contains(alias);

            if (!isCamelCase || unrecognized.Count > 0)
            {
                results.Add(new AliasIssueModel
                {
                    ContentTypeAlias = alias,
                    ContentTypeName = ct.Name ?? alias,
                    FolderPath = BuildFolderPath(ct.Path, containers),
                    IsCamelCase = isCamelCase,
                    UnrecognizedWords = unrecognized,
                    IsBlessed = isBlessed,
                });
            }
        }

        return results.OrderBy(r => r.IsCamelCase).ThenBy(r => r.ContentTypeName);
    }

    public HashSet<string> GetBlessedAliases() => _blessingStore.GetBlessed(BlessingKind.Alias);

    public void SetAliasBlessed(string contentTypeAlias, bool blessed) =>
        _blessingStore.SetBlessed(BlessingKind.Alias, contentTypeAlias, blessed);

    private static List<string> FindUnrecognizedWords(string alias, WordList wordList)
    {
        // Split on camelCase boundaries, keep only alpha-only segments
        var words = SplitRegex.Split(alias)
            .Select(w => w.ToLowerInvariant())
            .Where(w => w.Length >= 2 && w.All(char.IsLetter));

        return words
            .Where(w => !HunspellDictionary.TechAllowList.Contains(w) && !wordList.Check(w))
            .Distinct()
            .ToList();
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

public record AliasIssueModel
{
    public required string ContentTypeAlias { get; init; }
    public required string ContentTypeName { get; init; }
    public required string FolderPath { get; init; }
    public required bool IsCamelCase { get; init; }
    public required IReadOnlyList<string> UnrecognizedWords { get; init; }
    public bool IsBlessed { get; init; }
}
