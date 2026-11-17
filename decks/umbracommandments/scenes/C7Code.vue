<script setup>
// S13a, part 1: the navigation partial everyone has somewhere. It sits at the root of the tree it
// walks (world.js TREE_CODE, inside C7Tree): the next scene pulls back to show the whole tree.
import InlaySlide from '../components/InlaySlide.vue'
</script>

<template>
  <InlaySlide class="slide--dark nav-partial" :from="0.1">
    <span class="kicker">VII · Partials/Navigation.cshtml</span>
    <pre class="code"><code><span class="k">@inherits</span> UmbracoViewPage
@{
    <span class="k">var</span> menu = Model.Root()
        .<mark>Descendants&lt;ContentPage&gt;()</mark>
        .Where(x =&gt; x.ShowInMenu);
}
&lt;nav&gt;
  @foreach (<span class="k">var</span> page <span class="k">in</span> menu)
  {
    &lt;a href="@page.Url()"&gt;@page.Name&lt;/a&gt;
  }
&lt;/nav&gt;</code></pre>
  </InlaySlide>
</template>

<style scoped>
.nav-partial { padding: 60px 110px 100px; gap: 30px; }
.code {
  margin: 0;
  padding: 36px 44px;
  border-radius: 18px;
  background: var(--code-bg);
  color: #e6e3da;
  font: 400 40px/1.4 var(--mono);
}
.k { color: #9fb7ff; }
mark {
  background: rgba(195, 242, 64, 0.25);
  color: var(--k-green);
  border-radius: 6px;
  padding: 0 6px;
  box-shadow: 0 0 0 3px var(--k-green);
}
</style>
