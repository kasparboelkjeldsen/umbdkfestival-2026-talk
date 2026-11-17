using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Umbraco.Community.Sinners.Backend.Models;

[TableName(AliasBlessingDto.TableName)]
[PrimaryKey("Id", AutoIncrement = true)]
[ExplicitColumns]
public class AliasBlessingDto
{
    public const string TableName = "SinnersAliasBlessing";

    [Column("Id")] [PrimaryKeyColumn(AutoIncrement = true)] public int Id { get; set; }
    [Column("ContentTypeAlias")] public string ContentTypeAlias { get; set; } = null!;
}
