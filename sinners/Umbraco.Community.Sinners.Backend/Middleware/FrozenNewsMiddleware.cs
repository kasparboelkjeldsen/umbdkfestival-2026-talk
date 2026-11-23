using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Umbraco.Community.Sinners.Backend.Configuration;

namespace Umbraco.Community.Sinners.Backend.Middleware;

/// <summary>
/// Stage rig: the Welcome dashboard's news cards, frozen. Umbraco's backoffice asks the site for its news
/// (<c>GET /umbraco/management/api/v1/news-dashboard</c>) and the site asks news-dashboard.umbraco.com, whose
/// editors change the cards without notice: twice in the week of the talk. The Welcome easter egg
/// (<c>penance/haunt.ts</c>) is drawn for particular cards, so the package carries a snapshot of the feed
/// (<c>ui/news/feed.json</c> and its pictures, taken 23 November 2026; the source is the Extension's
/// <c>public/news</c>) and this answers the backoffice's request with it. No request leaves the machine, so
/// the cards are there without a network too.
/// Same guard as the rest of the rig: only in Development and only for requests from this machine (which
/// includes the deck's Vite proxy). <see cref="SinnersSettings.LiveNews"/> switches it off; so does a site
/// without the snapshot in its <c>wwwroot</c>. Then the request goes on to Umbraco as if this wasn't here.
/// </summary>
public class FrozenNewsMiddleware(RequestDelegate next, IOptionsMonitor<SinnersSettings> settings, IWebHostEnvironment env)
{
    public const string NewsPath = "/umbraco/management/api/v1/news-dashboard";

    /// <summary>Where the site's build puts the snapshot (the package's <c>ui</c> folder, copied to App_Plugins).</summary>
    public const string SnapshotPath = "App_Plugins/umbraco.community.sinners.frontend/news/feed.json";

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.Equals(NewsPath, StringComparison.OrdinalIgnoreCase)
            || !HttpMethods.IsGet(context.Request.Method)
            || settings.CurrentValue.LiveNews
            || !env.IsDevelopment()
            || !IsFromThisMachine(context))
        {
            await next(context);
            return;
        }

        var snapshot = env.WebRootFileProvider.GetFileInfo(SnapshotPath);
        if (!snapshot.Exists)
        {
            await next(context);
            return;
        }

        var response = context.Response;
        response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
        response.ContentType = "application/json; charset=utf-8";
        response.ContentLength = snapshot.Length;
        await response.SendFileAsync(snapshot);
    }

    private static bool IsFromThisMachine(HttpContext context)
    {
        var remote = context.Connection.RemoteIpAddress;
        return remote is not null && (IPAddress.IsLoopback(remote) || remote.Equals(context.Connection.LocalIpAddress));
    }
}
