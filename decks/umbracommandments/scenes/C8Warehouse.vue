<script setup>
// S14a · The warehouse. A content tree (the real UUI components, components/uui.js) with "Form
// submissions" open. Step 1: the column scrolls, and scrolls. Step 2: it tips back and recedes to
// the horizon. Step 3: one node with 4,000 versions, stacked behind it like a deck of cards going
// into the distance. Compressible.
import { useStep } from '@engine/useStep.js'
import InlaySlide from '../components/InlaySlide.vue'
import '../components/uui.js'
import { useNear } from '../components/near.js'

const { step } = useStep()
const show = useNear()
const pad = (n) => String(n).padStart(5, '0')
const subs = Array.from({ length: 40 }, (_, i) => `Submission ${pad(48213 - i)}`)
const far = Array.from({ length: 90 }, (_, i) => `Submission ${pad(48100 - i)}`)
const versions = Array.from({ length: 36 }, (_, i) => i)
</script>

<template>
  <InlaySlide class="slide--dark warehouse" :class="{ s1: step >= 1, s2: step >= 2, s3: step >= 3 }">
    <span class="kicker">VIII · the content tree</span>

    <!-- UUI is sized for a 14px UI: zoomed up, and left out of the audit (it measures unzoomed px) -->
    <div v-if="show" class="ui tree" data-audit="ignore">
      <uui-icon-registry-essential>
        <uui-box headline="Content">
          <uui-menu-item label="Home" has-children><uui-icon slot="icon" name="document" /></uui-menu-item>
          <uui-menu-item label="Settings" has-children><uui-icon slot="icon" name="settings" /></uui-menu-item>
          <uui-menu-item label="Form submissions (48,213)" has-children show-children active>
            <uui-icon slot="icon" name="folder" />
            <div class="column">
              <div class="scroll">
                <uui-menu-item v-for="(s, i) in [...subs, ...subs]" :key="i" :label="s"><uui-icon slot="icon" name="document" /></uui-menu-item>
              </div>
            </div>
          </uui-menu-item>
        </uui-box>
      </uui-icon-registry-essential>
    </div>

    <!-- step 2: the same column, tipped back to the horizon -->
    <div v-if="show" class="horizon" aria-hidden="true" data-audit="ignore">
      <div class="ui plane">
        <uui-icon-registry-essential>
          <uui-menu-item v-for="s in far" :key="s" :label="s"><uui-icon slot="icon" name="document" /></uui-menu-item>
        </uui-icon-registry-essential>
      </div>
    </div>

    <!-- step 3: one node, 4,000 versions -->
    <div v-if="show" class="stack" data-audit="ignore">
      <div class="deck3d">
        <div v-for="v in versions" :key="v" class="ui version" :style="{ '--k': v }">
          <uui-icon-registry-essential>
            <uui-ref-node name="Opening hours" :detail="`Version ${(4000 - v).toLocaleString('en')} · saved by the integration`">
              <uui-icon slot="icon" name="calendar" />
            </uui-ref-node>
          </uui-icon-registry-essential>
        </div>
      </div>
      <p class="caption">4,000 versions of one node</p>
    </div>
  </InlaySlide>
</template>

<style scoped>
.warehouse { padding: 56px 80px; overflow: hidden; }
.ui { font-family: Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: var(--uui-color-text, #060b1e); }
.tree {
  position: absolute;
  left: 80px;
  top: 130px;
  width: 330px;
  zoom: 1.9;
}
.tree uui-box { box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45); }
.column { height: 160px; overflow: hidden; }
.s1 .scroll { animation: scroll 9s linear infinite; }
@keyframes scroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }

.horizon {
  position: absolute;
  left: 900px;
  right: 40px;
  top: 120px;
  bottom: 40px;
  perspective: 900px;
  perspective-origin: 50% 0%;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.8s;
}
.plane {
  position: absolute;
  left: 20%;
  width: 60%;
  bottom: 0;
  zoom: 2;
  background: var(--uui-color-surface, #fff);
  border-radius: 6px;
  transform-origin: 50% 100%;
  transform: rotateX(78deg);
}
.s2 .horizon { opacity: 1; }
.s3 .horizon { opacity: 0.15; }

.stack {
  position: absolute;
  left: 940px;
  top: 300px;
  width: 820px;
  height: 560px;
  opacity: 0;
  transition: opacity 0.6s;
}
.s3 .stack { opacity: 1; }
.deck3d { position: absolute; inset: 0; perspective: 1100px; overflow: hidden; }
.version {
  position: absolute;
  left: 40px;
  top: 130px;
  width: 330px;
  zoom: 2.2;
  transform: translate3d(calc(var(--k) * 6px), calc(var(--k) * -7px), calc(var(--k) * -55px));
  opacity: calc(1 - var(--k) * 0.025);
  z-index: calc(100 - var(--k));
}
.version uui-ref-node { background: var(--uui-color-surface, #fff); border-radius: 6px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); }
.caption {
  position: absolute;
  left: 40px;
  bottom: 20px;
  margin: 0;
  font: italic 400 48px var(--serif);
  color: var(--k-green);
}
@media (prefers-reduced-motion: reduce) { .s1 .scroll { animation: none; } }
</style>
