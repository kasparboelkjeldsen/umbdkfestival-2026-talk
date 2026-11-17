using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Security;
using Umbraco.Community.Sinners.Backend.Configuration;

namespace Umbraco.Community.Sinners.Backend.Middleware;

/// <summary>
/// Stage rig: always logged in. When the backoffice sends the browser to its login page, sign in the
/// <see cref="SinnersSettings.AutoLoginEmail"/> user and bounce straight back to where it came from
/// (the OpenIddict authorize endpoint), so the auth flow completes without anyone typing anything.
/// Off unless the setting is set, the environment is Development and the request comes from this machine.
/// </summary>
public class AutoLoginMiddleware(
    RequestDelegate next,
    IOptionsMonitor<SinnersSettings> settings,
    IWebHostEnvironment env,
    ILogger<AutoLoginMiddleware> logger)
{
    private const string LoginPath = "/umbraco/login";

    public async Task InvokeAsync(HttpContext context, IBackOfficeSignInManager signInManager, IBackOfficeUserManager userManager)
    {
        var email = settings.CurrentValue.AutoLoginEmail;
        if (string.IsNullOrWhiteSpace(email)
            || !HttpMethods.IsGet(context.Request.Method)
            || !context.Request.Path.Equals(LoginPath, StringComparison.OrdinalIgnoreCase)
            || !env.IsDevelopment()
            || !IsFromThisMachine(context))
        {
            await next(context);
            return;
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            logger.LogWarning("Sinners auto-login: no backoffice user with email {Email}, showing the login page", email);
            await next(context);
            return;
        }

        await signInManager.SignInAsync(user, isPersistent: true);
        logger.LogInformation("Sinners auto-login: signed in {Email}", email);

        var returnUrl = context.Request.Query["ReturnUrl"].ToString();
        context.Response.Redirect(IsLocalUrl(returnUrl) ? returnUrl : "/umbraco");
    }

    private static bool IsFromThisMachine(HttpContext context)
    {
        var remote = context.Connection.RemoteIpAddress;
        return remote is not null && (IPAddress.IsLoopback(remote) || remote.Equals(context.Connection.LocalIpAddress));
    }

    // Only redirect within this site (no //evil.example or https://…)
    private static bool IsLocalUrl(string url) =>
        url.StartsWith('/') && !url.StartsWith("//") && !url.StartsWith("/\\");
}
