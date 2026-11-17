<script setup>
// S9a back: the data types as they should be.
import UuiTree from '../components/UuiTree.vue'

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
  <UuiTree label="III · the data types" title="Data Types" :items="items" note="Custom/<editor alias>. Reuse before you create." />
</template>
