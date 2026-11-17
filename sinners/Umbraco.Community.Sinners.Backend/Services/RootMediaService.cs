using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;

namespace Umbraco.Community.Sinners.Backend.Services;

// Commandment III (the root is bare): media items loose at the media root. No real fix, only a pretend one ✨.
public class RootMediaService(IMediaService mediaService, PenanceStateStore stateStore)
{
    public IEnumerable<RootMediaItemModel> GetRootMediaItems()
    {
        return mediaService.GetRootMedia()
            .Where(m => m.ContentType.Alias != Constants.Conventions.MediaTypes.Folder)
            .Select(m => new RootMediaItemModel
            {
                Key = m.Key,
                Name = m.Name ?? m.Key.ToString(),
                MediaTypeAlias = m.ContentType.Alias,
                CreateDate = m.CreateDate,
            })
            .OrderBy(m => m.Name);
    }

    public RootMediaAuditResult Audit()
    {
        var items = GetRootMediaItems().ToList();
        return new RootMediaAuditResult { Items = items, Pretending = IsPretending(items) };
    }

    /// <summary>
    /// The pretence holds while the root media is exactly the set that was pretended away: a new upload or a
    /// fresh install collapses it.
    /// </summary>
    public bool IsPretending(IReadOnlyCollection<RootMediaItemModel> items)
    {
        var pretended = stateStore.Read().PretendedRootMedia;
        return items.Count > 0
               && pretended.Count == items.Count
               && pretended.ToHashSet().SetEquals(items.Select(i => i.Key));
    }

    public void Pretend() =>
        stateStore.Update(s => s.PretendedRootMedia = GetRootMediaItems().Select(i => i.Key).ToList());

    /// <summary>
    /// The '0' demo reset: forget the root media pretence, so the sin shows again. (X's ✨ edited the csproj
    /// for real, so it stays until reset.ps1 strips uSync again.)
    /// </summary>
    public void ForgetPretence() => stateStore.Update(s => s.PretendedRootMedia = []);
}

public record RootMediaItemModel
{
    public required Guid Key { get; init; }
    public required string Name { get; init; }
    public required string MediaTypeAlias { get; init; }
    public required DateTime CreateDate { get; init; }
}

public record RootMediaAuditResult
{
    public required IReadOnlyList<RootMediaItemModel> Items { get; init; }
    public required bool Pretending { get; init; }
}
