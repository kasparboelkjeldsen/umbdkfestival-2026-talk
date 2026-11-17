<script setup>
// S9c back: the dictionary grouped by its dotted keys. Parents hold no value (III: a folder is only a folder).
import UuiTree from '../components/UuiTree.vue'

const items = [
  { name: 'Article', children: [{}] },
  {
    name: 'ContactForm', open: true, children: [
      { name: 'ContactForm.Email' }, { name: 'ContactForm.Message' }, { name: 'ContactForm.Name' }, { name: 'ContactForm.Send' },
    ],
  },
  { name: 'Footer', children: [{}] },
  { name: 'Navigation', children: [{}] },
  { name: 'Paging', children: [{}] },
  { name: 'Search', children: [{}] },
]
</script>

<template>
  <UuiTree label="III · the dictionary" title="Dictionary" :items="items" note="PascalCase, dotted. The parent is only a folder." />
</template>
