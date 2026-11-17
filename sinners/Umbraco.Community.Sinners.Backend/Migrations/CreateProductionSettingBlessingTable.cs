using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Migrations;

public class CreateProductionSettingBlessingTable : AsyncMigrationBase
{
    public CreateProductionSettingBlessingTable(IMigrationContext context) : base(context) { }

    protected override Task MigrateAsync()
    {
        if (!TableExists(ProductionSettingBlessingDto.TableName))
        {
            Create.Table<ProductionSettingBlessingDto>().Do();
        }
        return Task.CompletedTask;
    }
}
