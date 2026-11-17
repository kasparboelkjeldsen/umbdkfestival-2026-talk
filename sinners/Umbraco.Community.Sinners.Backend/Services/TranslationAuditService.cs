using System.Text.RegularExpressions;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Umbraco.Community.Sinners.Backend.Services;

public class TranslationAuditService
{
    private static readonly Regex PascalCaseSegmentRegex = new(@"^[A-Z][a-zA-Z0-9]*$", RegexOptions.Compiled);
    private static readonly Regex CamelSplitRegex = new(
        @"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])",
        RegexOptions.Compiled);

    private readonly IDictionaryItemService _dictionaryItemService;
    private readonly BlessingStore _blessingStore;

    public TranslationAuditService(IDictionaryItemService dictionaryItemService, BlessingStore blessingStore)
    {
        _dictionaryItemService = dictionaryItemService;
        _blessingStore = blessingStore;
    }

    public async Task<TranslationAuditResult> GetAuditAsync()
    {
        var allItems = (await _dictionaryItemService.GetDescendantsAsync(null)).ToList();
        var blessed = GetBlessedKeys();
        var wordList = HunspellDictionary.EnUs;

        var issues = new List<TranslationKeyIssueModel>();
        foreach (var item in allItems)
        {
            var isPascalCase = IsPascalCaseKey(item.ItemKey);
            var unrecognized = FindUnrecognizedWords(item.ItemKey, wordList);
            var isBlessed = blessed.Contains(item.ItemKey);

            if (!isPascalCase || unrecognized.Count > 0)
            {
                issues.Add(new TranslationKeyIssueModel
                {
                    ItemKey = item.ItemKey,
                    Id = item.Key,
                    IsPascalCase = isPascalCase,
                    UnrecognizedWords = unrecognized,
                    IsBlessed = isBlessed,
                });
            }
        }

        var rootItems = allItems.Where(i => i.ParentId == null).ToList();
        var suggestions = BuildGroupSuggestions(rootItems);

        return new TranslationAuditResult
        {
            Issues = issues.OrderBy(i => i.IsPascalCase).ThenBy(i => i.ItemKey).ToList(),
            GroupSuggestions = suggestions,
        };
    }

    public async Task<bool> CreateGroupAsync(string parentKey, IEnumerable<Guid> childIds)
    {
        // Find or create the parent item
        var existing = await _dictionaryItemService.GetAsync(parentKey);
        IDictionaryItem parent;
        if (existing is not null)
        {
            parent = existing;
        }
        else
        {
            var newItem = new DictionaryItem(parentKey);
            var result = await _dictionaryItemService.CreateAsync(newItem, Constants.Security.SuperUserKey);
            if (!result.Success) return false;
            parent = result.Result!;
        }

        foreach (var childId in childIds)
        {
            var child = await _dictionaryItemService.GetAsync(childId);
            if (child is not null)
                await _dictionaryItemService.MoveAsync(child, parent.Key, Constants.Security.SuperUserKey);
        }
        return true;
    }

    public HashSet<string> GetBlessedKeys() => _blessingStore.GetBlessed(BlessingKind.TranslationKey);

    public void SetKeyBlessed(string itemKey, bool blessed) =>
        _blessingStore.SetBlessed(BlessingKind.TranslationKey, itemKey, blessed);

    // A key is valid if every dot-separated segment is PascalCase
    private static bool IsPascalCaseKey(string key) =>
        key.Split('.').All(segment => PascalCaseSegmentRegex.IsMatch(segment));

    private static List<string> FindUnrecognizedWords(string key, WeCantSpell.Hunspell.WordList wordList)
    {
        var words = key.Split('.')
            .SelectMany(segment => CamelSplitRegex.Split(segment))
            .Select(w => w.ToLowerInvariant())
            .Where(w => w.Length >= 2 && w.All(char.IsLetter));

        return words
            .Where(w => !HunspellDictionary.TechAllowList.Contains(w) && !wordList.Check(w))
            .Distinct()
            .ToList();
    }

    private static List<GroupSuggestionModel> BuildGroupSuggestions(IEnumerable<IDictionaryItem> rootItems)
    {
        // Only consider root items whose key contains a dot
        var dottedItems = rootItems
            .Where(i => i.ItemKey.Contains('.'))
            .ToList();

        return dottedItems
            .GroupBy(i => i.ItemKey.Split('.')[0])
            .Where(g => g.Count() >= 2)
            .Select(g => new GroupSuggestionModel
            {
                ProposedParentKey = g.Key,
                Children = g
                    .OrderBy(i => i.ItemKey)
                    .Select(i => new GroupSuggestionChildModel { ItemKey = i.ItemKey, Id = i.Key })
                    .ToList(),
            })
            .OrderBy(s => s.ProposedParentKey)
            .ToList();
    }
}

public record TranslationAuditResult
{
    public required IReadOnlyList<TranslationKeyIssueModel> Issues { get; init; }
    public required IReadOnlyList<GroupSuggestionModel> GroupSuggestions { get; init; }
}

public record TranslationKeyIssueModel
{
    public required string ItemKey { get; init; }
    public required Guid Id { get; init; }
    public required bool IsPascalCase { get; init; }
    public required IReadOnlyList<string> UnrecognizedWords { get; init; }
    public bool IsBlessed { get; init; }
}

public record GroupSuggestionModel
{
    public required string ProposedParentKey { get; init; }
    public required IReadOnlyList<GroupSuggestionChildModel> Children { get; init; }
}

public record GroupSuggestionChildModel
{
    public required string ItemKey { get; init; }
    public required Guid Id { get; init; }
}
