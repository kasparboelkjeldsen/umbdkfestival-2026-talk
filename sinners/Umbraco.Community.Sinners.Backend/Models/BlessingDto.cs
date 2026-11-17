using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Umbraco.Community.Sinners.Backend.Models;

[TableName(TableName)]
[PrimaryKey("Id", AutoIncrement = true)]
[ExplicitColumns]
public class BlessingDto
{
    public const string TableName = "SinnersBlessing";

    [Column("Id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public int Id { get; set; }

    [Column("CompositionAlias")]
    public string CompositionAlias { get; set; } = null!;

    [Column("PropertyAlias")]
    public string PropertyAlias { get; set; } = null!;
}
