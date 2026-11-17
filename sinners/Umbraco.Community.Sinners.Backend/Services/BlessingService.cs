namespace Umbraco.Community.Sinners.Backend.Services;

/// <summary>Commandment I blessings: composition properties accepted as composable. Stored in <see cref="BlessingStore"/>.</summary>
public class BlessingService(BlessingStore store)
{
    public HashSet<(string CompositionAlias, string PropertyAlias)> GetBlessings() =>
        store.GetBlessed(BlessingKind.CompositionProperty)
            .Select(v => v.Split('.', 2))
            .Where(p => p.Length == 2)
            .Select(p => (p[0], p[1]))
            .ToHashSet();

    public void SetBlessed(string compositionAlias, string propertyAlias, bool blessed) =>
        store.SetBlessed(BlessingKind.CompositionProperty, $"{compositionAlias}.{propertyAlias}", blessed);
}
