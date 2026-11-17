using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Community.Sinners.Backend.Configuration;
using Umbraco.Community.Sinners.Backend.Migrations;
using Umbraco.Community.Sinners.Backend.Services;

namespace Umbraco.Community.Sinners.Backend.Composers;

public class ServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<SinnersSettings>(builder.Config.GetSection(SinnersSettings.SectionName));

        // State that outlives a request: the blessings file, the pretences, the cached sin status
        builder.Services.AddSingleton<BlessingStore>();
        builder.Services.AddSingleton<PenanceStateStore>();
        builder.Services.AddSingleton<SinStatusCache>();

        builder.Services.AddScoped<DocTypeClassificationService>();
        builder.Services.AddScoped<BlessingService>();
        builder.Services.AddScoped<ContentNotComposableService>();
        builder.Services.AddScoped<TypeWriteScope>();
        builder.Services.AddScoped<FoldInService>();
        builder.Services.AddScoped<DataTypeOrganizationService>();
        builder.Services.AddScoped<ProgramCsAnalyzerService>();
        builder.Services.AddScoped<ProductionReadinessService>();
        builder.Services.AddScoped<AliasAuditService>();
        builder.Services.AddScoped<TranslationAuditService>();
        builder.Services.AddScoped<RootMediaService>();
        builder.Services.AddScoped<RootContentAuditService>();
        builder.Services.AddScoped<USyncAuditService>();
        builder.Services.AddScoped<ViewConfessionService>();
        builder.Services.AddScoped<ExodusService>();
        builder.Services.AddScoped<SinStatusService>();

        builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, DemoSinSeeder>();

        builder.PackageMigrationPlans()
            .Add<SinnersMigrationPlan>();
    }
}
