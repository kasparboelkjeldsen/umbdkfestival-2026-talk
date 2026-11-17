using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Umbraco.Community.Sinners.Backend.Models;

[TableName("SinnersDocTypeClassification")]
[PrimaryKey("ContentTypeAlias", AutoIncrement = false)]
[ExplicitColumns]
public class DocTypeClassificationDto
{
    public const string TableName = "SinnersDocTypeClassification";

    [Column("ContentTypeAlias")]
    public string ContentTypeAlias { get; set; } = null!;

    [Column("Classification")]
    public string Classification { get; set; } = null!;

    [Column("CreatedUtc")]
    public DateTime CreatedUtc { get; set; }

    [Column("UpdatedUtc")]
    public DateTime UpdatedUtc { get; set; }
}
