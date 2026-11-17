<script setup>
// The rows of a UuiTree: real <uui-menu-item>s, nested. `children: [{}]` just shows a caret.
import './uui.js'

defineOptions({ name: 'UuiTreeItems' })
defineProps({ items: { type: Array, required: true } })
const icon = (it) => it.icon ?? (it.folder ? 'folder' : 'document')
</script>

<template>
  <uui-menu-item
    v-for="(it, i) in items.filter((x) => x.name)"
    :key="i"
    :label="it.name"
    :has-children="!!it.children"
    :show-children="!!it.open"
    :active="!!it.active"
  >
    <uui-icon slot="icon" :name="icon(it)" />
    <UuiTreeItems v-if="it.open && it.children" :items="it.children" />
  </uui-menu-item>
</template>
