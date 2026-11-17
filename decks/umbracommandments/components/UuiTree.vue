<script setup>
// A backoffice tree, built from Umbraco's own UI components (<uui-box>, <uui-menu-item>): the
// static "after" on the back of a live card, i.e. the absolved demo site as it will look.
//
//   <UuiTree label="III · the data types" title="Data Types" :items="[{ name: 'Custom', folder: true, open: true, children: [...] }]" />
//
// items: { name, folder?, icon? (a UUI essential icon), open?, active?, children? }
import InlaySlide from './InlaySlide.vue'
import UuiTreeItems from './UuiTreeItems.vue'
import { useNear } from './near.js'

const show = useNear()

defineProps({
  label: { type: String, required: true },   // the kicker: what this is
  title: { type: String, required: true },   // the tree's root (the box headline)
  items: { type: Array, required: true },
  note: { type: String, default: '' },
})
</script>

<template>
  <InlaySlide class="slide--dark uui-tree">
    <span class="kicker">After · {{ label }}</span>
    <!-- UUI is sized for a 14px UI: zoomed up, and left out of the audit (it measures unzoomed px) -->
    <div v-if="show" class="ui" data-audit="ignore">
      <uui-icon-registry-essential>
        <uui-box :headline="title">
          <UuiTreeItems :items="items" />
        </uui-box>
      </uui-icon-registry-essential>
    </div>
    <p v-if="note" class="note">{{ note }}</p>
  </InlaySlide>
</template>

<style scoped>
.uui-tree { padding: 56px 80px 90px; gap: 30px; }
.ui {
  zoom: 1.9;
  width: 420px;
  font-family: Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: var(--uui-color-text, #060b1e);
}
.ui uui-box { box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45); }
.note {
  position: absolute;
  right: 90px;
  bottom: 120px;
  width: 640px;
  margin: 0;
  font: italic 400 44px/1.25 var(--serif);
  color: var(--k-green);
}
</style>
