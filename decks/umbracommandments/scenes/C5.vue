<script setup>
import Commandment from '../components/Commandment.vue'
import Zalgo from '../curse/Zalgo.vue'
</script>

<template>
  <Commandment :n="5" spill>
    <template #title>A production site runs in production mode.</template>
    <template #lead>If your editors can edit templates in <Zalgo text="production" :from="0.25" :to="0.6" :height="7" />, you don't have a CMS. You have a loaded gun.</template>
    <template #points>
      <li><span class="mono">ApplicationUrl</span> set, built with <span class="mono">--configuration release</span></li>
      <li>HTTPS only. No model generation, no template editing</li>
      <li>A separate frontend? Then it has no backoffice:</li>
    </template>
    <pre class="code rise" style="--d: 4" data-audit="ignore"><code>app.UseUmbraco()
   .WithMiddleware(u => { <span class="off">//u.UseBackOffice();</span> u.UseWebsite(); })
   .WithEndpoints(u => { <span class="off">//u.UseBackOfficeEndpoints();</span> u.UseWebsiteEndpoints(); });</code></pre>
  </Commandment>
</template>

<style scoped>
.code {
  margin: 0;
  padding: 22px 28px;
  border-radius: 14px;
  background: var(--code-bg);
  color: var(--k-light);
  font: 400 24px/1.5 var(--mono);
  white-space: pre;
  overflow: hidden;
}
.off { color: var(--k-green); }
</style>
