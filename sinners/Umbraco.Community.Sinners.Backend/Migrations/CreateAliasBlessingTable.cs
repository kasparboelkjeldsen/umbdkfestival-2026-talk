using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Migrations;

public class CreateAliasBlessingTable : AsyncMigrationBase
{
    public CreateAliasBlessingTable(IMigrationContext context) : base(context) { }

    protected override Task MigrateAsync()
    {
        if (!TableExists(AliasBlessingDto.TableName))
        {
            Create.Table<AliasBlessingDto>().Do();
        }
        return Task.CompletedTask;
    }
}
