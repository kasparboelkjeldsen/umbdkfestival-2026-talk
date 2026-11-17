using Microsoft.Extensions.Logging;

namespace Umbraco.Community.Sinners.Backend.Services;

/// <summary>
/// The sin bridge's numbers: one row per commandment, counted the same way the Penance Board counts its badges.
/// <c>sins</c> is what is still unabsolved: blessed and pretended-away sins don't count.
/// </summary>
public class SinStatusService(
    ContentNotComposableService compositionService,
    DocTypeClassificationService classificationService,
    DataTypeOrganizationService dataTypeService,
    TranslationAuditService translationService,
    RootMediaService rootMediaService,
    ProgramCsAnalyzerService programCsService,
    ProductionReadinessService productionService,
    AliasAuditService aliasService,
    ViewConfessionService confessionService,
    ExodusService exodusService,
    RootContentAuditService rootContentService,
    USyncAuditService uSyncService,
    SinStatusCache cache,
    ILogger<SinStatusService> logger)
{
    public static readonly string[] Titles =
    [
        "Content is not composable",
        "Four content types: Page, Block, Data, Composition",
        "The root is bare, and a folder is only a folder",
        "Compose in your IComposer, not Program.cs",
        "A production site runs in production mode",
        "Thy names: aliases English camelCase; translation keys PascalCase, dot-separated",
        "Views render; they don't search",
        "Umbraco is not your database",
        "A root node is not a rendering node",
        "uSync when not on Umbraco Cloud",
    ];

    public async Task<SinStatusResult> GetAsync()
    {
        if (cache.TryGet(out var cached, out var generation)) return cached;
        var result = await ComputeAsync();
        cache.Set(result, generation);
        return result;
    }

    private async Task<SinStatusResult> ComputeAsync()
    {
        var rows = new List<CommandmentStatus>();

        // Each commandment on its own: one that throws reports -1 instead of taking the endpoint down
        async Task Add(int number, Func<Task<(int Sins, bool Pretended, int Blessed)>> count)
        {
            try
            {
                var (sins, pretended, blessed) = await count();
                rows.Add(new CommandmentStatus { Number = number, Title = Titles[number - 1], Sins = sins, Pretended = pretended, Blessed = blessed });
            }
            catch (Exception e)
            {
                logger.LogWarning(e, "Sinners status: commandment {Number} could not be counted", number);
                rows.Add(new CommandmentStatus { Number = number, Title = Titles[number - 1], Sins = -1 });
            }
        }

        await Add(1, async () =>
        {
            var props = (await compositionService.GetSinfulCompositionsAsync()).SelectMany(c => c.SinfulProperties).ToList();
            return (props.Count(p => !p.IsBlessed), false, props.Count(p => p.IsBlessed));
        });

        await Add(2, async () =>
        {
            var unclassified = (await classificationService.GetAllWithClassification()).Count(c => c.Classification is null);
            return (unclassified, false, 0);
        });

        await Add(3, async () =>
        {
            var dataTypes = (await dataTypeService.GetUnorganizedAsync()).Count();
            var groups = (await translationService.GetAuditAsync()).GroupSuggestions.Count;
            var media = rootMediaService.Audit();
            var mediaSins = media.Pretending ? 0 : media.Items.Count;
            return (dataTypes + groups + mediaSins, media.Pretending, 0);
        });

        await Add(4, () =>
        {
            var r = programCsService.Audit();
            var sins = r.Found ? (r.UseUmbracoSavedToVariable ? 1 : 0) + r.ExtraMiddleware.Count + r.ExtraEndpoints.Count : 0;
            return Task.FromResult((sins, false, 0));
        });

        await Add(5, () =>
        {
            var missing = productionService.Audit().MissingSettings;
            return Task.FromResult((missing.Count(s => !s.IsBlessed), false, missing.Count(s => s.IsBlessed)));
        });

        await Add(6, async () =>
        {
            var aliases = (await aliasService.GetAliasIssuesAsync()).ToList();
            var keys = (await translationService.GetAuditAsync()).Issues;
            var sins = aliases.Count(a => !a.IsBlessed) + keys.Count(k => !k.IsBlessed);
            var blessed = aliases.Count(a => a.IsBlessed) + keys.Count(k => k.IsBlessed);
            return (sins, false, blessed);
        });

        await Add(7, () =>
        {
            var hits = confessionService.Audit().Hits;
            return Task.FromResult((hits.Count(h => !h.IsConfessed), false, 0));
        });

        await Add(8, () => Task.FromResult((exodusService.CountSinners(), false, 0)));

        await Add(9, async () =>
        {
            var r = await rootContentService.AuditAsync();
            return (r.RootNodes.Count(n => n.HasTemplate), false, 0);
        });

        await Add(10, () =>
        {
            var r = uSyncService.Audit();
            var sins = r.CsprojFound && !r.HasUSync && !r.HasUmbracoDeploy ? 1 : 0;
            return Task.FromResult((sins, r.Pretended, 0));
        });

        return new SinStatusResult
        {
            Commandments = rows,
            Total = rows.Sum(r => Math.Max(0, r.Sins)),
        };
    }
}

/// <summary>
/// The status is polled every couple of seconds, so it's kept for a moment. Every mutating Sinners API call
/// clears it (<see cref="Controllers.InvalidateSinStatusAttribute"/>), so the deck never reads a count from
/// before the action it was just told about. While such a call is running the last count is handed out as it
/// is: a status poll that reads content types in the middle of a fix can deadlock the site (see
/// <see cref="TypeWriteScope"/>), and the fresh count comes right after anyway.
/// </summary>
public class SinStatusCache
{
    private static readonly TimeSpan CacheFor = TimeSpan.FromMilliseconds(1500);
    private readonly Lock _lock = new();
    private (DateTime At, long Generation, SinStatusResult Result)? _entry;
    private long _generation;
    private int _writes;
    private DateTime _lastWriteBegan;

    // (a write that never reported back stops counting after two minutes)
    private bool Writing => _writes > 0 && DateTime.UtcNow - _lastWriteBegan < TimeSpan.FromMinutes(2);

    public bool TryGet(out SinStatusResult result, out long generation)
    {
        lock (_lock)
        {
            generation = _generation;
            if (_entry is { } e && (Writing || (e.Generation == _generation && DateTime.UtcNow - e.At < CacheFor)))
            {
                result = e.Result;
                return true;
            }
        }
        result = null!;
        return false;
    }

    // A count that started before an invalidation is stale the moment it finishes: keep it only if nothing changed meanwhile
    public void Set(SinStatusResult result, long generation)
    {
        lock (_lock)
            if (generation == _generation) _entry = (DateTime.UtcNow, generation, result);
    }

    public void Invalidate()
    {
        lock (_lock) _generation++;
    }

    public void BeginWrite()
    {
        lock (_lock)
        {
            _writes++;
            _lastWriteBegan = DateTime.UtcNow;
        }
    }

    public void EndWrite()
    {
        lock (_lock)
        {
            if (_writes > 0) _writes--;
            _generation++;
        }
    }
}

public record SinStatusResult
{
    public required IReadOnlyList<CommandmentStatus> Commandments { get; init; }
    public required int Total { get; init; }
}

public record CommandmentStatus
{
    public required int Number { get; init; }
    public required string Title { get; init; }
    public required int Sins { get; init; }
    public bool Pretended { get; init; }
    public int Blessed { get; init; }
}
