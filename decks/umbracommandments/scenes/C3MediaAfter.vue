<script setup>
// S9b back: media in folders, nothing at the root.
import UuiTree from '../components/UuiTree.vue'

const items = [
  { name: 'Brand', folder: true, open: true, children: [{ name: 'Logos', folder: true }] },
  {
    name: 'Images', folder: true, open: true, children: [
      { name: 'Articles', folder: true, children: [{}] },
      { name: 'People', folder: true, children: [{}] },
      { name: 'Products', folder: true, children: [{}] },
    ],
  },
  { name: 'Documents', folder: true, children: [{}] },
  { name: 'Videos', folder: true, children: [{}] },
]
</script>

<template>
  <UuiTree label="III · the media" title="Media" :items="items" note="Nothing at the root. Not even the logo." />
</template>
