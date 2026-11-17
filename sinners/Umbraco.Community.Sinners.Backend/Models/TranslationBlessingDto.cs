using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Umbraco.Community.Sinners.Backend.Models;

[TableName(TranslationBlessingDto.TableName)]
[PrimaryKey("Id", AutoIncrement = true)]
[ExplicitColumns]
public class TranslationBlessingDto
{
    public const string TableName = "SinnersTranslationBlessing";

    [Column("Id")] [PrimaryKeyColumn(AutoIncrement = true)] public int Id { get; set; }
    [Column("ItemKey")] public string ItemKey { get; set; } = null!;
}
