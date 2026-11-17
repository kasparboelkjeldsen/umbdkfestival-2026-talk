using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Community.Sinners.Backend.Services;

namespace Umbraco.Community.Sinners.Backend.Controllers;

/// <summary>
/// After any Sinners call that changes something (anything but GET), drop the cached sin status, so the deck's
/// next poll (it re-polls the moment the Board posts "absolved") counts the new state.
/// </summary>
[AttributeUsage(AttributeTargets.Class)]
public class InvalidateSinStatusAttribute : Attribute, IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!HttpMethods.IsGet(context.HttpContext.Request.Method))
            context.HttpContext.RequestServices.GetRequiredService<SinStatusCache>().BeginWrite();
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (!HttpMethods.IsGet(context.HttpContext.Request.Method))
            context.HttpContext.RequestServices.GetRequiredService<SinStatusCache>().EndWrite();
    }
}
