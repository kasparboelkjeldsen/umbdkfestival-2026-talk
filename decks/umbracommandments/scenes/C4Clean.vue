<script setup>
// S10a back: the Program.cs it could be. Everything else lives in composers (or, for things that
// aren't Umbraco's, extension methods on the builder).
import InlaySlide from '../components/InlaySlide.vue'
import Code from '@engine/components/Code.vue'

const SRC = `var builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();

app.UseUmbraco()
    .WithMiddleware(u => { u.UseBackOffice(); u.UseWebsite(); })
    .WithEndpoints(u => { u.UseBackOfficeEndpoints(); u.UseWebsiteEndpoints(); });

await app.RunAsync();`
</script>

<template>
  <InlaySlide class="slide--dark code-clean">
    <span class="kicker">IV · Program.cs, as it could be</span>
    <Code :code="SRC" :size="27" title="Program.cs" />
  </InlaySlide>
</template>

<style scoped>
.code-clean { padding: 50px 80px 90px; gap: 28px; }
</style>
