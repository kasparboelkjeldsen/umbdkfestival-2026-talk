using System.Text.Json;
using Microsoft.AspNetCore.Hosting;

namespace Umbraco.Community.Sinners.Backend.Services;

/// <summary>
/// The demo's own memory, kept server-side so the deck's status endpoint can see it: the pretend fixes (✨)
/// and the confessed hits of commandment VII. Lives in <c>umbraco/Data/Sinners/penance-state.json</c>, so a
/// reset (which deletes the data folder) forgets it together with the database. Unlike the blessings file it
/// is not meant to be read by humans.
/// </summary>
public class PenanceStateStore(IWebHostEnvironment env)
{
    public class State
    {
        /// <summary>III: the root media keys that were pretended away. The pretence holds while root media is exactly this set.</summary>
        public List<Guid> PretendedRootMedia { get; set; } = [];

        /// <summary>X: uSync was "installed" by the ✨ button (a csproj injection nobody restored or built).</summary>
        public bool PretendedUSync { get; set; }

        /// <summary>VII: signatures (file|line text) of hits that have been confessed.</summary>
        public List<string> Confessed { get; set; } = [];
    }

    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };
    private readonly Lock _lock = new();
    private State? _state;

    private string FilePath =>
        Path.Combine(env.ContentRootPath, "umbraco", "Data", "Sinners", "penance-state.json");

    public State Read()
    {
        lock (_lock)
        {
            var s = Load();
            return new State
            {
                PretendedRootMedia = [.. s.PretendedRootMedia],
                PretendedUSync = s.PretendedUSync,
                Confessed = [.. s.Confessed],
            };
        }
    }

    public void Update(Action<State> change)
    {
        lock (_lock)
        {
            var s = Load();
            change(s);
            var path = FilePath;
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            File.WriteAllText(path, JsonSerializer.Serialize(s, JsonOptions));
        }
    }

    private State Load()
    {
        if (_state is not null) return _state;
        try
        {
            var path = FilePath;
            _state = File.Exists(path) ? JsonSerializer.Deserialize<State>(File.ReadAllText(path)) ?? new State() : new State();
        }
        catch (JsonException)
        {
            _state = new State();
        }
        return _state;
    }
}
