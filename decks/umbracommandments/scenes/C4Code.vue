<script setup>
// S10a front: the Program.cs you have. Small on purpose (it's the mess, not the lines, that reads);
// the TODO at the top and the uSync note at line 49 are lit. Turns over to the clean one.
import InlaySlide from '../components/InlaySlide.vue'

const SRC = `// TODO: clean this up before going live lol
using Umbraco.Cms.Core;
using Microsoft.AspNetCore.Cors;
using Serilog;
using MyProject.Core.Services;
using MyProject.Core.Services.Legacy;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o => o.AddPolicy("AllowAll", p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddHttpClient("weather", c =>
    c.BaseAddress = new Uri("https://api.example.com/"));
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProductService2, ProductService>(); // temp
builder.Services.AddSingleton<ICache, MemoryCacheThing>();
builder.Services.AddTransient<INewsletterSync, NewsletterSync>();
// builder.Services.AddTransient<INewsletterSync, OldSync>();
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("Smtp"));
builder.Services.AddHostedService<NightlyImportJob>();
builder.Services.AddHostedService<NightlyImportJob2>();

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddNotificationHandler<ContentSavingNotification, SaveHandler>()
    .AddNotificationHandler<ContentPublishedNotification, PubHandler>()
    .Build();

builder.Services.AddScoped<ISearchThing, SearchThing>(); // works tho

WebApplication app = builder.Build();

app.UseCors("AllowAll");
await app.BootUmbracoAsync();
app.UseHttpsRedirection();
app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        // dotnet add MyProject.Web package uSync   <- run this!!
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });
app.MapGet("/healthz", () => "ok");
app.MapGet("/api/clear-cache", (ICache c) => c.Clear()); // secure later
await app.RunAsync();`

const lines = SRC.split('\n').map((text, i) => ({ n: i + 1, text, hot: i === 0 || i === 48 }))
const half = 28
</script>

<template>
  <InlaySlide class="slide--dark code-messy">
    <span class="kicker">IV · Program.cs, as found</span>
    <div class="cols" data-audit="ignore">
      <div v-for="col in [lines.slice(0, half), lines.slice(half)]" :key="col[0].n" class="col">
        <span v-for="l in col" :key="l.n" class="line" :class="{ hot: l.hot, com: l.text.trim().startsWith('//') }"><i>{{ l.n }}</i>{{ l.text || ' ' }}</span>
      </div>
    </div>
  </InlaySlide>
</template>

<style scoped>
.code-messy { padding: 40px 50px 70px; gap: 22px; }
.cols { display: flex; gap: 36px; }
.col {
  flex: 1;
  margin: 0;
  padding: 18px 20px;
  border-radius: 14px;
  background: var(--code-bg);
  color: #d9d7d0;
  /* 18px: the longest lines (76 characters, "// secure later") fit their column; at 19.5 they were cut off */
  font: 400 18px/1.48 var(--mono);
  overflow: hidden;
}
.line { display: block; white-space: pre; }
.line i { display: inline-block; width: 38px; font-style: normal; opacity: 0.4; }
.com { color: #8f9a7a; }
.hot { background: rgba(195, 242, 64, 0.22); color: var(--k-green); }
</style>
