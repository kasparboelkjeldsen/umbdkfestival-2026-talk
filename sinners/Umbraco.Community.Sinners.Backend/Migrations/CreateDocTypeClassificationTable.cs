using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Community.Sinners.Backend.Models;

namespace Umbraco.Community.Sinners.Backend.Migrations;

public class CreateDocTypeClassificationTable : AsyncMigrationBase
{
    public CreateDocTypeClassificationTable(IMigrationContext context) : base(context) { }

    protected override Task MigrateAsync()
    {
        if (!TableExists(DocTypeClassificationDto.TableName))
        {
            Create.Table<DocTypeClassificationDto>().Do();
        }

        return Task.CompletedTask;
    }
}
