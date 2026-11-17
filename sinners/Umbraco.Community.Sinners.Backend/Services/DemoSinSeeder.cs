using System.Diagnostics;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Models.TemporaryFile;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Community.Sinners.Backend.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.PixelFormats;

namespace Umbraco.Community.Sinners.Backend.Services;

/// <summary>
/// Stage rig: plants the sins of commandments III (media) and VIII on a fresh site, so a reset always has
/// something to absolve. Runs once at boot, in the background, when <see cref="SinnersSettings.SeedSins"/> is
/// on, the environment is Development and the "Form submissions" node doesn't exist yet (an Exodus empties it
/// but leaves it standing, so it doesn't re-seed after the demo).
/// <list type="bullet">
/// <item>III: three media items loose at the media root, uploaded through the same temporary-file path as the
/// backoffice: the Image "final-final-v2.jpg", the File "Brochure 2019.pdf" and the Image "logo" (fixed keys)</item>
/// <item>VIII: "Form submissions" (a root collection, <see cref="FormSubmissionsKey"/>) with threshold + 100 submissions</item>
/// <item>VIII: "Visitor counter" inside it, published threshold + 20 times</item>
/// </list>
/// Commandment VII's sin (a nav partial that walks the tree) is a file, so reset.ps1 writes that one.
/// </summary>
public class DemoSinSeeder(
    IOptionsMonitor<SinnersSettings> settings,
    IWebHostEnvironment env,
    IRuntimeState runtimeState,
    ICoreScopeProvider coreScopeProvider,
    IContentService contentService,
    IContentTypeService contentTypeService,
    IContentTypeContainerService containerService,
    IDataTypeService dataTypeService,
    IShortStringHelper shortStringHelper,
    IMediaService mediaService,
    IMediaEditingService mediaEditingService,
    ITemporaryFileService temporaryFileService,
    ILogger<DemoSinSeeder> logger) : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    public static readonly Guid FormSubmissionsKey = new("0d1e5e08-8a2e-4f0e-9d7b-5f0a5b5e0008");
    public static readonly Guid VisitorCounterKey = new("0d1e5e08-8a2e-4f0e-9d7b-5f0a5b5e0100");

    // III: the media root, as every site ends up after a year of "just upload it here for now". Unrelated keys
    // on purpose: the media folder name comes from the key, and look-alike keys share a folder (delete one, lose both)
    public static readonly Guid FinalFinalKey = new("7f3c2a91-5b4e-4d1a-9c6e-2e8b1f0a3d55");
    public static readonly Guid BrochureKey = new("c41d8e27-93a0-4b6f-8f12-6d5e0b7a9c03");
    public static readonly Guid LogoKey = new("2a96f0b4-e18c-4c7d-a35b-91f4d06c8e7a");

    private static int _started;

    public Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
    {
        if (!settings.CurrentValue.SeedSins || !env.IsDevelopment() || runtimeState.Level != RuntimeLevel.Run)
            return Task.CompletedTask;
        if (contentService.GetById(FormSubmissionsKey) is not null)
            return Task.CompletedTask;
        if (Interlocked.Exchange(ref _started, 1) == 1)
            return Task.CompletedTask;

        // Don't hold up the boot: the site is usable while the sins pile up
        _ = Task.Run(async () =>
        {
            // The media first: three uploads take a moment, the submissions take ~20 s
            try { await SeedRootMediaAsync(); }
            catch (Exception e) { logger.LogError(e, "Sinners seeder: failed to plant the media sins of commandment III"); }
            try { await SeedAsync(); }
            catch (Exception e) { logger.LogError(e, "Sinners seeder: failed to plant the sins of commandment VIII"); }
        }, CancellationToken.None);
        return Task.CompletedTask;
    }

    private async Task SeedRootMediaAsync()
    {
        await CreateRootMediaAsync(FinalFinalKey, "final-final-v2.jpg", Constants.MediaTypes.Guids.ImageGuid, "final-final-v2.jpg", SunsetJpeg());
        await CreateRootMediaAsync(BrochureKey, "Brochure 2019.pdf", Constants.MediaTypes.Guids.FileGuid, "brochure-2019.pdf", BrochurePdf());
        await CreateRootMediaAsync(LogoKey, "logo", Constants.MediaTypes.Guids.ImageGuid, "logo.png", LogoPng());
        logger.LogInformation("Sinners seeder: three media items loose at the media root");
    }

    // The backoffice's own upload path: a temporary file, then the media editing service picks it up by id,
    // so the file lands in the media file system and width/height/bytes are filled in as for a real upload.
    private async Task CreateRootMediaAsync(Guid key, string name, Guid mediaTypeKey, string fileName, byte[] bytes)
    {
        if (mediaService.GetById(key) is not null) return;

        var temporaryFileKey = Guid.NewGuid();
        var upload = await temporaryFileService.CreateAsync(new CreateTemporaryFileModel
        {
            Key = temporaryFileKey,
            FileName = fileName,
            OpenReadStream = () => new MemoryStream(bytes),
        });
        if (!upload.Success)
            throw new InvalidOperationException($"Could not upload {fileName}: {upload.Status}");

        var created = await mediaEditingService.CreateAsync(new MediaCreateModel
        {
            Key = key,
            ContentTypeKey = mediaTypeKey,
            ParentKey = null,
            Variants = [new VariantModel { Name = name }],
            Properties =
            [
                new PropertyValueModel
                {
                    Alias = Constants.Conventions.Media.File,
                    Value = new JsonObject { ["temporaryFileId"] = temporaryFileKey.ToString() },
                },
            ],
        }, Constants.Security.SuperUserKey);
        if (!created.Success)
            throw new InvalidOperationException($"Could not create media {name}: {created.Status}");
    }

    // A sunset nobody remembers the source of
    private static byte[] SunsetJpeg()
    {
        const int w = 960, h = 600;
        using var image = new Image<Rgb24>(w, h);
        for (var y = 0; y < h; y++)
        for (var x = 0; x < w; x++)
        {
            var t = (float)y / h;
            var dx = x - w * 0.62f;
            var dy = y - h * 0.58f;
            var sun = Math.Clamp(1.4f - MathF.Sqrt(dx * dx + dy * dy) / 90f, 0f, 1f);
            var r = 255 * (0.98f - 0.25f * t) + 40 * sun;
            var g = 255 * (0.55f - 0.3f * t) + 180 * sun;
            var b = 255 * (0.35f + 0.35f * t) + 120 * sun;
            if (y > h * 0.72f) { r *= 0.35f; g *= 0.3f; b *= 0.45f; } // the sea
            image[x, y] = new Rgb24((byte)Math.Clamp(r, 0, 255), (byte)Math.Clamp(g, 0, 255), (byte)Math.Clamp(b, 0, 255));
        }
        using var stream = new MemoryStream();
        image.SaveAsJpeg(stream, new JpegEncoder { Quality = 82 });
        return stream.ToArray();
    }

    // A ring on transparency: every site's "logo" before the real one arrived
    private static byte[] LogoPng()
    {
        const int size = 256;
        using var image = new Image<Rgba32>(size, size);
        for (var y = 0; y < size; y++)
        for (var x = 0; x < size; x++)
        {
            var d = MathF.Sqrt((x - 127.5f) * (x - 127.5f) + (y - 127.5f) * (y - 127.5f));
            var alpha = Math.Clamp((20f - MathF.Abs(d - 92f)) / 2f, 0f, 1f); // a 40 px ring, soft edges
            image[x, y] = new Rgba32(53, 68, 177, (byte)(alpha * 255));
        }
        using var stream = new MemoryStream();
        image.SaveAsPng(stream);
        return stream.ToArray();
    }

    // A one-page PDF, offsets and all
    private static byte[] BrochurePdf()
    {
        const string text = "BT /F1 48 Tf 72 720 Td (Brochure 2019) Tj 0 -60 Td /F1 20 Tf (Prices valid until 31 December 2019.) Tj ET";
        string[] objects =
        [
            "<< /Type /Catalog /Pages 2 0 R >>",
            "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
            $"<< /Length {text.Length} >>\nstream\n{text}\nendstream",
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        ];
        var pdf = new StringBuilder("%PDF-1.4\n");
        var offsets = new List<int>();
        for (var i = 0; i < objects.Length; i++)
        {
            offsets.Add(pdf.Length);
            pdf.Append($"{i + 1} 0 obj\n{objects[i]}\nendobj\n");
        }
        var xref = pdf.Length;
        pdf.Append($"xref\n0 {objects.Length + 1}\n0000000000 65535 f \n");
        foreach (var offset in offsets) pdf.Append($"{offset:D10} 00000 n \n");
        pdf.Append($"trailer\n<< /Size {objects.Length + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n");
        return Encoding.ASCII.GetBytes(pdf.ToString());
    }

    private async Task SeedAsync()
    {
        var watch = Stopwatch.StartNew();
        var children = settings.CurrentValue.ExodusChildThreshold + 100;
        var versions = settings.CurrentValue.ExodusVersionThreshold + 20;
        logger.LogInformation("Sinners seeder: planting {Children} form submissions and a counter with {Versions} versions", children, versions);

        var folderKey = await EnsureDataFolderAsync();

        var submission = await CreateTypeAsync("formSubmission", "Form submission", "icon-message", folderKey, ct =>
        {
            AddProperty(ct, Constants.DataTypes.Guids.TextstringGuid, "email", "Email");
            AddProperty(ct, Constants.DataTypes.Guids.TextareaGuid, "message", "Message");
            AddProperty(ct, Constants.DataTypes.Guids.DatePickerWithTimeGuid, "submittedAt", "Submitted at");
        });
        var counter = await CreateTypeAsync("visitorCounter", "Visitor counter", "icon-chart-curve", folderKey, ct =>
            AddProperty(ct, Constants.DataTypes.Guids.NumericGuid, "visits", "Visits"));
        var container = await CreateTypeAsync("formSubmissions", "Form submissions", "icon-inbox", folderKey, ct =>
        {
            ct.AllowedAsRoot = true;
            ct.ListView = Constants.DataTypes.Guids.ListViewContentGuid;
            ct.AllowedContentTypes =
            [
                new ContentTypeSort(submission.Key, 0, submission.Alias),
                new ContentTypeSort(counter.Key, 1, counter.Alias),
            ];
        });

        var inbox = contentService.Create("Form submissions", Constants.System.Root, container);
        inbox.Key = FormSubmissionsKey;
        contentService.Save(inbox);
        Publish(inbox);

        // One transaction for the lot, in batches so no single save holds hundreds of nodes
        var random = new Random(8);
        string[] first = ["Anna", "Bo", "Carl", "Dorte", "Emil", "Freja", "Gustav", "Hanne", "Ida", "Jens", "Karen", "Lars", "Mette", "Niels", "Ole", "Pia"];
        string[] topics = ["Quote request", "Newsletter", "Complaint", "Job application", "Partnership", "Support", "Feedback", "Booking"];
        var start = DateTime.Now.AddDays(-children);
        using (var scope = coreScopeProvider.CreateCoreScope())
        {
            var batch = new List<IContent>();
            for (var i = 1; i <= children; i++)
            {
                var name = first[random.Next(first.Length)];
                var node = contentService.Create($"{topics[random.Next(topics.Length)]} #{i:0000}", inbox.Id, submission);
                node.SetValue("email", $"{name.ToLowerInvariant()}{i}@example.com");
                node.SetValue("message", $"Hi, this is {name}. Please get back to me about this. (Submission {i})");
                node.SetValue("submittedAt", start.AddDays(i).AddMinutes(random.Next(1440)));
                batch.Add(node);
                if (batch.Count == 100)
                {
                    contentService.Save(batch);
                    batch.Clear();
                }
            }
            if (batch.Count > 0) contentService.Save(batch);
            scope.Complete();
        }
        logger.LogInformation("Sinners seeder: {Children} submissions in {Ms} ms", children, watch.ElapsedMilliseconds);

        // Every publish keeps the old version: a counter saved on every visit is a log table in disguise
        var visits = contentService.Create("Visitor counter", inbox.Id, counter);
        visits.Key = VisitorCounterKey;
        using (var scope = coreScopeProvider.CreateCoreScope())
        {
            for (var i = 1; i <= versions; i++)
            {
                visits.SetValue("visits", i * 17);
                contentService.Save(visits);
                Publish(visits);
            }
            scope.Complete();
        }

        logger.LogInformation("Sinners seeder: done in {Ms} ms", watch.ElapsedMilliseconds);
    }

    private void Publish(IContent content)
    {
        var result = contentService.Publish(content, ["*"]);
        if (!result.Success)
            throw new InvalidOperationException($"Could not publish {content.Name}: {result.Result}");
    }

    private void AddProperty(IContentType ct, Guid dataTypeKey, string alias, string name)
    {
        var dataType = dataTypeService.GetAsync(dataTypeKey).GetAwaiter().GetResult()
                       ?? throw new InvalidOperationException($"Built-in data type {dataTypeKey} is missing");
        if (!ct.PropertyGroups.Contains("content"))
            ct.AddPropertyGroup("content", "Content");
        ct.AddPropertyType(new PropertyType(shortStringHelper, dataType) { Alias = alias, Name = name }, "content", "Content");
    }

    private async Task<IContentType> CreateTypeAsync(string alias, string name, string icon, Guid folderKey, Action<IContentType> configure)
    {
        var existing = contentTypeService.Get(alias);
        if (existing is not null) return existing;

        var ct = new ContentType(shortStringHelper, Constants.System.Root)
        {
            Alias = alias,
            Name = name,
            Icon = icon,
            IsElement = false,
        };
        configure(ct);
        var attempt = await contentTypeService.CreateAsync(ct, Constants.Security.SuperUserKey);
        if (!attempt.Success)
            throw new InvalidOperationException($"Could not create document type {alias}: {attempt.Result}");
        await contentTypeService.MoveAsync(ct.Key, folderKey);
        return contentTypeService.Get(ct.Key)!;
    }

    // A "Data" folder: Rule II's autofill reads the folder name, so these classify themselves
    private async Task<Guid> EnsureDataFolderAsync()
    {
        var existing = (await containerService.GetAllAsync())
            .FirstOrDefault(c => c.ParentId == Constants.System.Root && string.Equals(c.Name, "Data", StringComparison.OrdinalIgnoreCase));
        if (existing is not null) return existing.Key;

        var attempt = await containerService.CreateAsync(null, "Data", null, Constants.Security.SuperUserKey);
        if (!attempt.Success) throw new InvalidOperationException("Could not create the Data document type folder");
        return attempt.Result!.Key;
    }
}
