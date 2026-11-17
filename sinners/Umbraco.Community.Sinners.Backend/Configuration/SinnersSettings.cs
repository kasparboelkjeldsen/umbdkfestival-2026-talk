namespace Umbraco.Community.Sinners.Backend.Configuration;

public class SinnersSettings
{
    public const string SectionName = "Sinners";

    public bool FunAllowed { get; set; } = false;

    /// <summary>
    /// Root folder name for custom (non-built-in) data types. Defaults to "Custom" if not set.
    /// Built-in Umbraco data types always go under "Umbraco".
    /// </summary>
    public string? DatatypePrefix { get; set; }

    /// <summary>
    /// Stage rig: the backoffice user to sign in automatically whenever the login page is hit, so the
    /// demo is always logged in. Only in the Development environment and only for requests from this
    /// machine. Unset = off.
    /// </summary>
    public string? AutoLoginEmail { get; set; }

    /// <summary>
    /// Where Bless decisions ("this is fine, I accept this sin") are written: a pretty-printed JSON file,
    /// relative to the content root unless absolute. Default <c>sinners.blessings.json</c>.
    /// </summary>
    public string BlessingsPath { get; set; } = "sinners.blessings.json";

    /// <summary>
    /// Commandment VIII (Exodus): where exported nodes are written, relative to the content root unless
    /// absolute. Default <c>umbraco/Data/sinners-exodus</c> (wiped by reset.ps1 with the rest of the data folder).
    /// </summary>
    public string ExodusPath { get; set; } = "umbraco/Data/sinners-exodus";

    /// <summary>Commandment VIII: a parent with more than this many children of one document type is a warehouse.</summary>
    public int ExodusChildThreshold { get; set; } = 500;

    /// <summary>Commandment VIII: a node with more than this many versions is a log table.</summary>
    public int ExodusVersionThreshold { get; set; } = 100;

    /// <summary>
    /// Stage rig: in Development, seed the sins of commandment VIII (a "Form submissions" warehouse and a
    /// node with too many versions) at boot, once per fresh database. Off unless set.
    /// </summary>
    public bool SeedSins { get; set; }
}
