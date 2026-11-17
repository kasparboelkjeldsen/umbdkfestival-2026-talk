using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using Umbraco.Community.Sinners.Backend.Middleware;

namespace Umbraco.Community.Sinners.Backend.Composers;

/// <summary>
/// Adds the stage rig's middleware at the very start of Umbraco's pipeline, without touching Program.cs (that
/// would be a sin against commandment IV): the auto-login (<see cref="AutoLoginMiddleware"/>, does nothing unless
/// Sinners:AutoLoginEmail is set) and the deck's sin bridge (<see cref="SinStatusMiddleware"/>). Both only answer
/// in Development, to requests from this machine.
/// </summary>
public class AutoLoginComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder) =>
        builder.Services.Configure<UmbracoPipelineOptions>(options =>
            options.AddFilter(new UmbracoPipelineFilter("Sinners.StageRig")
            {
                PrePipeline = app =>
                {
                    app.UseMiddleware<AutoLoginMiddleware>();
                    app.UseMiddleware<SinStatusMiddleware>();
                },
            }));
}
