using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Migrations;

public class CreateTranslationBlessingTable : AsyncMigrationBase
{
    public CreateTranslationBlessingTable(IMigrationContext context) : base(context) { }

    protected override Task MigrateAsync()
    {
        if (!TableExists(TranslationBlessingDto.TableName))
        {
            Create.Table<TranslationBlessingDto>().Do();
        }
        return Task.CompletedTask;
    }
}
