<script setup>
// S15b: the content root, live: two sites with Home pages, plus the EVIL starter kit's Home at the
// root. After "Seek Root Sanctuary" there's a template-less site root. Fallback: the two-sites shot.
import Evidence from '../components/Evidence.vue'
</script>

<template>
  <Evidence label="IX · the content root, live" :shots="[{ src: '/assets/two-sites.jpg', alt: 'Two sites, each under its own root' }]" />
</template>
