using Umbraco.Cms.Core.Packaging;

namespace Umbraco.Community.Sinners.Backend.Migrations;

public class SinnersMigrationPlan : PackageMigrationPlan
{
    public SinnersMigrationPlan() : base("Sinners") { }

    protected override void DefinePlan()
    {
        From(string.Empty)
            .To<CreateDocTypeClassificationTable>("sinners-v1-create-doc-type-classification-table")
            .To<CreateBlessingTable>("sinners-v2-create-blessing-table")
            .To<CreateAliasBlessingTable>("sinners-v3-create-alias-blessing-table")
            .To<CreateTranslationBlessingTable>("sinners-v4-create-translation-blessing-table")
            .To<CreateProductionSettingBlessingTable>("sinners-v5-create-production-setting-blessing-table");
    }
}
