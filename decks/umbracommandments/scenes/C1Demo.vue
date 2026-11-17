<script setup>
// S7a · The composition demo, built instead of recorded: a document type and a page made from it,
// side by side, in Umbraco's own UI (components/uui.js). A cursor does the clicking.
//   steps 1–3: the tour, a lime ring on what's being talked about: the document type, its Body,
//              then the page (the other pane dims).
//   step 4: swap the Body property's data type → the page keeps every block. Safe.
//   step 5: remove the Content Blocks composition → the warning nobody reads.
//   step 6: Yes. Article Blocks goes in instead: a composition with the very same Body, same alias,
//           same data type. The blocks crumble anyway, and the history has nothing to roll back to.
//   step 7: the ring on the history: 12 versions, not one of them remembers the Body.
import { useStep } from '@engine/useStep.js'
import InlaySlide from '../components/InlaySlide.vue'
import '../components/uui.js'
import { useNear } from '../components/near.js'

const { step } = useStep()
const show = useNear()
const blocks = [
  { name: 'Hero', detail: 'Why Umbraco rocks', icon: 'picture' },
  { name: 'Rich Text', detail: '“It started as a pun…”', icon: 'document' },
  { name: 'Quote', detail: '“Folders are free. Regret is not.”', icon: 'info' },
  { name: 'Call to action', detail: 'Come argue in the hallway', icon: 'link' },
]
</script>

<template>
  <InlaySlide
    class="slide--dark c1-demo"
    :class="{ 'hl-doc': step === 1, 'hl-body': step === 2, 'hl-page': step === 3, s1: step === 4, s2: step === 5, s3: step >= 6, 'hl-hist': step >= 7 }"
  >
    <div class="labels">
      <span class="tag safe" :class="{ lit: step === 4 }">Data type swap: safe</span>
      <span class="tag gone" :class="{ lit: step >= 6 }">Composition swap: deletion</span>
    </div>

    <!-- UUI is sized for a 14px UI: zoomed up, and left out of the audit (it measures unzoomed px) -->
    <div v-if="show" class="panes" data-audit="ignore">
      <uui-icon-registry-essential>
        <div class="ui doctype">
          <uui-box headline="Article · Document Type">
            <p class="label">Compositions</p>
            <div class="compositions">
              <uui-tag look="secondary" class="comp old-comp">Content Blocks <span class="x">✕<i class="cursor c2" /></span></uui-tag>
              <uui-tag look="primary" color="positive" class="comp new-comp">Article Blocks</uui-tag>
              <uui-tag look="secondary">SEO</uui-tag>
            </div>
            <p class="label">Properties</p>
            <div class="prop body">
              <uui-icon name="document" />
              <div>
                <strong>Body</strong>
                <span class="from"><span class="from-old">from Content Blocks</span><span class="from-new">from Article Blocks</span></span>
                <div class="dt">
                  <span class="chip dt-old">Block List · Content</span>
                  <span class="chip dt-new">Block List · Content v2<i class="cursor c1" /></span>
                </div>
              </div>
            </div>
            <div class="prop">
              <uui-icon name="document" />
              <div><strong>Meta description</strong> <span class="from">from SEO</span><div class="dt"><span class="chip">Textarea</span></div></div>
            </div>
          </uui-box>

          <!-- the warning, exactly as carefully worded as it needs to be -->
          <div class="modal">
            <uui-dialog>
              <uui-dialog-layout headline="Warning">
                <p class="warn">A lot of users don't really read before they click.</p>
                <uui-button slot="actions" look="secondary" label="Cancel">Cancel</uui-button>
                <uui-button slot="actions" look="primary" color="danger" label="Yes" class="yes">Yes<i class="cursor c3" /></uui-button>
              </uui-dialog-layout>
            </uui-dialog>
          </div>
        </div>

        <div class="ui content">
          <uui-box headline="Why Umbraco rocks · Content">
            <p class="label">Body</p>
            <div class="blocks">
              <uui-ref-node v-for="(b, i) in blocks" :key="b.name" :name="b.name" :detail="b.detail" class="block" :style="{ '--i': i }">
                <uui-icon slot="icon" :name="b.icon" />
                <span slot="tag" class="kept">✓</span>
              </uui-ref-node>
              <uui-button look="placeholder" label="Add content" class="empty">Add content</uui-button>
            </div>
            <p class="label">History</p>
            <p class="history"><uui-icon name="sync" /> 12 versions <span class="hist-note">· not one of them remembers the Body</span></p>
          </uui-box>
        </div>
      </uui-icon-registry-essential>
    </div>

    <p class="verdict ok">The page keeps every block.</p>
    <p class="verdict bad">Same Body. Same data type.<br />Every block: gone.</p>
  </InlaySlide>
</template>

<style scoped>
.c1-demo { padding: 70px 90px 100px; gap: 34px; }
.labels { display: flex; gap: 30px; }
.tag { font: 700 38px var(--sans); padding: 14px 30px; border-radius: 999px; opacity: 0.55; transition: opacity 0.4s, transform 0.4s; }
.tag.lit { opacity: 1; transform: scale(1.06); }
.safe { background: var(--k-green); color: var(--k-dark); }
.gone { background: var(--k-red); color: var(--k-dark); }

.panes uui-icon-registry-essential { display: flex; gap: 60px; align-items: flex-start; }
.ui {
  zoom: 1.9;
  width: 420px;
  font-family: Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: var(--uui-color-text, #060b1e);
}
.ui uui-box { box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45); transition: box-shadow 0.4s; }
.ui { transition: opacity 0.4s; }

/* ---- the tour (steps 1–3): a lime ring on what's being talked about, the other pane dims ---- */
.hl-doc .doctype uui-box,
.hl-page .content uui-box {
  box-shadow: 0 0 0 3px #c3f240, 0 0 34px rgba(195, 242, 64, 0.5), 0 14px 36px rgba(0, 0, 0, 0.45);
}
.hl-doc .content, .hl-body .content, .hl-page .doctype { opacity: 0.4; }
.prop.body { transition: background 0.4s, box-shadow 0.4s; }
.hl-body .prop.body { background: rgba(195, 242, 64, 0.3); box-shadow: 0 0 0 2px #c3f240; }
/* step 7: the history (its note is already showing from step 6, so no delay) */
.hl-hist .history { background: rgba(195, 242, 64, 0.3); box-shadow: 0 0 0 2px #c3f240; }
.hl-hist .hist-note { transition-delay: 0s; }
.hl-hist .doctype { opacity: 0.4; }
.label { margin: 10px 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.6; }

/* ---- the document type ---- */
.doctype { position: relative; }
.compositions { display: flex; gap: 6px; align-items: center; }
.comp { transition: opacity 0.4s, transform 0.4s, max-width 0.4s; }
.x { position: relative; display: inline-block; margin-left: 4px; padding: 0 2px; border-radius: 3px; font-size: 10px; opacity: 0.7; }
.s2 .old-comp { box-shadow: 0 0 0 2px #d42054; }
.s2 .x { background: #d42054; color: #fff; opacity: 1; transition: background 0.1s 0.75s, color 0.1s 0.75s; }
/* step 3: Content Blocks out, Article Blocks in (after the Yes) */
.new-comp { display: none; }
.s3 .new-comp { display: inline-flex; animation: comp-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s both; }
@keyframes comp-in { from { opacity: 0; transform: scale(0.4); } }
/* Content Blocks leaves no gap behind */
.s3 .old-comp { animation: comp-out 0.6s ease-in 0.9s both; }
@keyframes comp-out {
  60% { opacity: 0; transform: translateY(-8px) scale(0.6); max-width: 200px; margin-right: 0; }
  to { opacity: 0; transform: translateY(-8px) scale(0.6); max-width: 0; padding: 0; margin-right: -6px; }
}

.prop { display: flex; gap: 10px; align-items: flex-start; padding: 8px 6px; margin: 0 -6px; border-top: 1px solid var(--uui-color-divider, #eee); border-radius: 4px; }
.prop uui-icon { margin-top: 3px; }
.from { position: relative; display: inline-grid; margin-left: 4px; font-size: 12px; opacity: 0.6; }
.from > span { grid-area: 1 / 1; }
.from-new { opacity: 0; }
.dt { position: relative; display: grid; margin-top: 4px; justify-items: start; }
.chip {
  grid-area: 1 / 1;
  position: relative;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--uui-color-border, #d8d7d9);
  font-size: 12.5px;
  color: var(--uui-color-interactive, #3544b1);
  white-space: nowrap;
}
.dt-new { opacity: 0; }

/* step 1: the cursor clicks the data type, the new one lands, the row glows, every block stays */
.s1 .prop.body { animation: glow 1.4s ease-out 1s 2; }
@keyframes glow {
  0% { background: rgba(195, 242, 64, 0); }
  30% { background: rgba(195, 242, 64, 0.55); }
  100% { background: rgba(195, 242, 64, 0.2); }
}
.s1 .dt-old { animation: dt-out 0.4s ease-in 0.85s both; }
.s1 .dt-new { animation: dt-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.05s both; border-color: #5c8a00; background: #e9fbc2; font-weight: 700; }
@keyframes dt-out { to { opacity: 0; transform: translateX(-30px); text-decoration: line-through; } }
@keyframes dt-in { from { opacity: 0; transform: translateX(30px) scale(0.7); } to { opacity: 1; transform: none; } }
/* after step 1 the swap is done: the new data type stays */
.s2 .dt-old, .s3 .dt-old { opacity: 0; }
.s2 .dt-new, .s3 .dt-new { opacity: 1; }

/* step 3: the Body goes with its composition, and comes back with the new one: same alias, same data type */
.s3 .prop.body { animation: body-swap 1.3s ease-in-out 0.9s both; }
@keyframes body-swap {
  0% { opacity: 1; }
  35%, 55% { opacity: 0.15; }
  100% { opacity: 1; }
}
.s3 .from-old { animation: fade-out 0.1s linear 1.5s both; }
.s3 .from-new { animation: fade-in-new 0.1s linear 1.5s both; }
@keyframes fade-out { to { opacity: 0; } }
@keyframes fade-in-new { to { opacity: 1; } }

/* ---- the warning ---- */
.modal {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: rgba(6, 11, 30, 0.55);
  opacity: 0;
  visibility: hidden;
  /* transitions, not animations: thumbnails and the overview show the end state of a step */
  transition: opacity 0.25s ease-in 0.85s, visibility 0s 1.1s; /* closing: after the Yes click */
}
.modal uui-dialog { width: 360px; transform: scale(0.85); }
.warn { margin: 0; font-size: 15px; line-height: 1.4; }
.s2 .modal { opacity: 1; visibility: visible; transition: opacity 0.35s ease-out 1s, visibility 0s 1s; }
.s2 .modal uui-dialog, .s3 .modal uui-dialog { transform: none; }
.s2 .modal uui-dialog { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 1s; }
.yes { position: relative; }

/* ---- the cursor: flies in to its target, clicks, and fades ---- */
.cursor {
  position: absolute;
  left: 55%;
  top: 55%;
  z-index: 5;
  width: 22px;
  height: 22px;
  pointer-events: none;
  opacity: 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M3 2 L3 19 L8 14.5 L11.2 21.5 L14 20.3 L10.9 13.4 L17.5 13.4 Z' fill='white' stroke='black' stroke-width='1.4' stroke-linejoin='round'/></svg>") no-repeat center / contain;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
}
.cursor::after {
  content: '';
  position: absolute;
  left: -9px;
  top: -9px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
  opacity: 0;
}
.s1 .c1, .s2 .c2, .s3 .c3 { animation: cursor 1.6s cubic-bezier(0.25, 0.8, 0.3, 1) both; }
.s1 .c1::after, .s2 .c2::after, .s3 .c3::after { animation: click 0.45s ease-out 0.75s both; }
@keyframes cursor {
  0% { opacity: 0; transform: translate(140px, 110px); }
  10% { opacity: 1; }
  45% { transform: none; }
  50% { transform: scale(0.85); }
  56% { transform: none; opacity: 1; }
  100% { opacity: 0; transform: translate(14px, 18px); }
}
@keyframes click {
  from { opacity: 1; transform: scale(0.3); }
  to { opacity: 0; transform: scale(1.8); }
}

/* ---- the page ---- */
.blocks { position: relative; display: flex; flex-direction: column; gap: 6px; min-height: 220px; }
.block { transition: opacity 0.5s calc(2.1s + var(--i) * 0.18s), transform 0.5s calc(2.1s + var(--i) * 0.18s), filter 0.5s calc(2.1s + var(--i) * 0.18s); }
.kept {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #5c8a00;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  opacity: 0;
  transform: scale(0.3);
}
.s1 .kept { animation: kept 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) calc(1.5s + var(--i) * 0.15s) both; }
@keyframes kept { to { opacity: 1; transform: none; } }
.s1 .block { box-shadow: 0 0 0 2px #8bc34a; border-radius: 4px; transition: box-shadow 0.4s 1.4s; }
.s3 .block { opacity: 0; transform: translateY(14px) rotate(calc((var(--i) - 1.5) * 4deg)); filter: blur(2px); }
.empty { position: absolute; left: 0; right: 0; top: 60px; opacity: 0; transition: opacity 0.5s; }
.s3 .empty { opacity: 1; transition-delay: 3.1s; }
.history { display: flex; align-items: center; gap: 6px; margin: 0 -6px; padding: 4px 6px; border-radius: 4px; font-size: 13px; transition: background 0.4s, box-shadow 0.4s; }
.hist-note { color: #d42054; opacity: 0; transition: opacity 0.5s; }
.s3 .hist-note { opacity: 1; transition-delay: 3.5s; }

.verdict {
  position: absolute;
  left: 1000px;
  right: 90px;
  bottom: 60px;
  margin: 0;
  font: italic 400 46px/1.2 var(--serif);
  opacity: 0;
  transition: opacity 0.5s;
}
.verdict.ok { color: var(--k-green); }
.verdict.bad { left: 90px; right: auto; bottom: 150px; color: var(--k-red); } /* under the document type: two lines don't fit under the page */
.s1 .verdict.ok { opacity: 1; transition-delay: 2s; }
.s3 .verdict.bad { opacity: 1; transition-delay: 3.9s; }
</style>
