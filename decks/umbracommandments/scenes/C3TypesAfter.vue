<script setup>
// S9a back: the data types as they should be.
// Step 1: a comment from the discussion that asks Umbraco for this (umbraco/Umbraco-CMS #13054,
// "Put all umbraco data types into a folder under Data Types"): Lotte Pitcher, 29 November 2022.
// Verbatim, one sentence of a longer comment (fetched 20 Nov 2026).
import { useStep } from '@engine/useStep.js'
import UuiTree from '../components/UuiTree.vue'

const { step } = useStep()

const items = [
  {
    name: 'Custom', folder: true, open: true, children: [
      { name: 'Umbraco.BlockList', folder: true, open: true, children: [{ name: 'Content Blocks' }, { name: 'Hero Slides' }] },
      { name: 'Umbraco.BlockGrid', folder: true, children: [{}] },
      { name: 'Umbraco.ContentPicker', folder: true, children: [{}] },
      { name: 'Umbraco.MediaPicker3', folder: true, children: [{}] },
      { name: 'Umbraco.RichText', folder: true, children: [{}] },
      { name: 'Umbraco.TextBox', folder: true, children: [{}] },
    ],
  },
  { name: 'Umbraco (the built-ins)', folder: true, children: [{}] },
]
</script>

<template>
  <UuiTree label="III · the data types" title="Data Types" :items="items" note="Custom/<editor alias>. Reuse before you create.">
    <figure class="comment" :class="{ on: step >= 1 }">
      <figcaption><b>LottePitcher</b> <span>on Nov 29, 2022</span></figcaption>
      <blockquote>
        If you've ever inherited a site and all the data types are in the root then
        <mark>your heart sinks</mark>, it takes more mental effort to work out what has been added for this site.
      </blockquote>
      <p class="where">umbraco/Umbraco-CMS · Discussion #13054</p>
    </figure>
  </UuiTree>
</template>

<style scoped>
/* a comment as GitHub shows one: light, like the tree beside it */
.comment {
  position: absolute;
  right: 90px;
  top: 200px;
  width: 800px;
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  color: #1f2328;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45);
  font-family: var(--sans);
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.45s ease-out, transform 0.45s ease-out;
}
.comment.on { opacity: 1; transform: none; }
.comment figcaption {
  padding: 18px 32px;
  background: #f6f8fa;
  border-bottom: 2px solid #d1d9e0;
  font-size: 30px;
}
.comment figcaption span { color: #59636e; }
.comment blockquote { margin: 0; padding: 30px 32px 22px; font-size: 40px; line-height: 1.3; }
.comment mark { background: var(--k-green); color: inherit; padding: 0 6px; border-radius: 4px; }
.where { margin: 0; padding: 0 32px 24px; font-size: 26px; color: #59636e; }
</style>
