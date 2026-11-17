using WeCantSpell.Hunspell;

namespace Umbraco.Community.Sinners.Backend.Services;

internal static class HunspellDictionary
{
    private static readonly Lazy<WordList> _enUs = new(Load, LazyThreadSafetyMode.ExecutionAndPublication);

    public static WordList EnUs => _enUs.Value;

    // Common tech/web terms that aren't in the English dictionary but are valid in Umbraco aliases
    public static readonly HashSet<string> TechAllowList = new(StringComparer.OrdinalIgnoreCase)
    {
        "umbraco", "cms", "html", "css", "url", "seo", "api", "cta", "faq",
        "meta", "nav", "ui", "ux", "pdf", "svg", "cdn", "rss", "xml", "json",
        "dto", "vm", "mvc", "spa", "js", "ts", "id", "ids", "db", "sku",
        "utm", "og", "rte", "cta",
    };

    private static WordList Load()
    {
        var asm = typeof(HunspellDictionary).Assembly;
        using var aff = asm.GetManifestResourceStream("Umbraco.Community.Sinners.Backend.Dictionaries.en_US.aff")!;
        using var dic = asm.GetManifestResourceStream("Umbraco.Community.Sinners.Backend.Dictionaries.en_US.dic")!;
        return WordList.CreateFromStreams(dic, aff);
    }
}
