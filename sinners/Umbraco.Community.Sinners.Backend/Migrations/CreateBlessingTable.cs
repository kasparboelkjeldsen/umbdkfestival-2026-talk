using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Migrations;

public class CreateBlessingTable : AsyncMigrationBase
{
    public CreateBlessingTable(IMigrationContext context) : base(context) { }

    protected override Task MigrateAsync()
    {
        if (!TableExists(BlessingDto.TableName))
        {
            Create.Table<BlessingDto>().Do();
        }

        return Task.CompletedTask;
    }
}
