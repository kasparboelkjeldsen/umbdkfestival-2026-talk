using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.Sinners.Backend.Services;

namespace Umbraco.Community.Sinners.Backend.Middleware;

/// <summary>
/// The sin bridge: <c>GET /umbraco/sinners/status</c>, anonymous, so the talk's deck can poll how many sins are
/// left per commandment. Same guard as the auto-login: only in Development and only for requests from this
/// machine (which includes the deck's Vite proxy). Everything else falls through to Umbraco, which 404s it.
/// </summary>
public class SinStatusMiddleware(RequestDelegate next, IWebHostEnvironment env)
{
    public const string StatusPath = "/umbraco/sinners/status";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.Equals(StatusPath, StringComparison.OrdinalIgnoreCase)
            || !(HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsHead(context.Request.Method))
            || !env.IsDevelopment()
            || !IsFromThisMachine(context))
        {
            await next(context);
            return;
        }

        var response = context.Response;
        response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
        response.Headers.Pragma = "no-cache";
        response.ContentType = "application/json; charset=utf-8";

        // Before the install has finished there are no services to ask
        var runtimeState = context.RequestServices.GetRequiredService<IRuntimeState>();
        if (runtimeState.Level != RuntimeLevel.Run)
        {
            response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await response.WriteAsync(JsonSerializer.Serialize(new { error = $"Umbraco is not running yet ({runtimeState.Level})" }, JsonOptions));
            return;
        }

        var status = await context.RequestServices.GetRequiredService<SinStatusService>().GetAsync();
        await response.WriteAsync(JsonSerializer.Serialize(status, JsonOptions));
    }

    private static bool IsFromThisMachine(HttpContext context)
    {
        var remote = context.Connection.RemoteIpAddress;
        return remote is not null && (IPAddress.IsLoopback(remote) || remote.Equals(context.Connection.LocalIpAddress));
    }
}
