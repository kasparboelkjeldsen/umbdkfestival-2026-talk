using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;

namespace Umbraco.Community.Sinners.Backend.Services;

/// <summary>
/// One transaction for a fix that writes document types, opened so that it cannot deadlock the site.
/// </summary>
/// <remarks>
/// <para>
/// What it guards against (seen in a rehearsal, 2026-11-12: Fold In hung the whole site, every request
/// waiting): Umbraco keeps all content types in one cache entry, refilled under a lock
/// (<c>FullDataSetRepositoryCachePolicy._getAllLock</c>). A content type save empties that entry in the
/// middle of its own transaction and then reads the types again, which needs the lock. If another thread
/// noticed the empty entry first (Examine re-indexing the content Fold In just saved, a status poll, a
/// backoffice request), that thread holds the lock while its query waits for the writer's table locks
/// (SQLite with <c>Cache=Shared</c>), and the writer waits for the lock: nobody moves again.
/// </para>
/// <para>
/// So: fill the type caches first, then write inside a scope with its own (scoped) repository cache. The
/// save now empties the scope's cache, not the shared one, so no other thread ever has a reason to take
/// the lock while this transaction is open. And because everything is one scope, the notifications
/// (Examine, cache refreshers) only go out when it has committed.
/// </para>
/// <para>
/// Don't "fix" this by removing <c>Cache=Shared</c> from the connection string on 18.2.1 (it is what the
/// CMS does from 18.3.0 on): tried, and the backoffice API then stalled for two minutes after a restart,
/// the cache instruction job stuck on a write.
/// </para>
/// </remarks>
public class TypeWriteScope(
    ICoreScopeProvider scopeProvider,
    IContentTypeService contentTypes,
    IMediaTypeService mediaTypes,
    IMemberTypeService memberTypes)
{
    /// <summary>Complete() the scope when every step succeeded; disposing it without rolls everything back.</summary>
    public ICoreScope Begin()
    {
        // Content, media and member types share one query behind their caches: fill all three
        _ = contentTypes.GetAll().Count();
        _ = mediaTypes.GetAll().Count();
        _ = memberTypes.GetAll().Count();
        return scopeProvider.CreateCoreScope(repositoryCacheMode: RepositoryCacheMode.Scoped);
    }
}
