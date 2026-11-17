using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Umbraco.Community.Sinners.Backend.Models;

[TableName(ProductionSettingBlessingDto.TableName)]
[PrimaryKey("Id", AutoIncrement = true)]
[ExplicitColumns]
public class ProductionSettingBlessingDto
{
    public const string TableName = "SinnersProductionSettingBlessing";

    [Column("Id")] [PrimaryKeyColumn(AutoIncrement = true)] public int Id { get; set; }
    [Column("SettingKey")] public string SettingKey { get; set; } = null!;
}
