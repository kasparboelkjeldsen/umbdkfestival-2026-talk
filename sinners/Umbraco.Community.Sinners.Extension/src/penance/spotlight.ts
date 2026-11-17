// A spotlight on something in the backoffice: a lime ring round it, a slow pulse, and the rest of
// the page dimmed. The clicker script (presenter.ts) lights one on an exhibit page before it leaves,
// so the room knows where to look: a mouse cursor is no help on a projector.
//
// The ring is its own element on <body> (fixed, on top, click-through), not a style on the target:
// shadow DOM and overflow would clip an outline, and nothing of Umbraco's is touched. It follows the
// target (the backoffice re-lays itself out as it loads) and waits for it to exist. It is shown as
// a popover, which puts it in the browser's top layer: Umbraco's modals are <dialog>s up there, and
// no z-index gets above them (exhibit I is a document type in a modal).

export type Highlight =
    | string
    | {
          /** CSS selector, looked for through every shadow root (the backoffice is web components all the way down) */
          selector: string;
          /** Only elements whose text contains this (or any of these) */
          text?: string | string[];
          /** Only elements whose `label` attribute is exactly this (or one of these): a tree item by its name */
          label?: string | string[];
          /** A closed tree item (uui-menu-item) is opened first, so the ring goes round it and its children */
          expand?: boolean;
          /** Ring round ALL the matches together (their bounding box) instead of the first */
          all?: boolean;
          /** px of air between the target and the ring (default 6) */
          pad?: number;
      };

const list = (v?: string | string[]) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/** Every element matching `selector` (and the text / label asked for), in `root` and all shadow roots under it. */
export function deepQueryAll(root: ParentNode, selector: string, text?: string | string[], label?: string | string[]): Element[] {
    const texts = list(text);
    const labels = list(label);
    // (code editors write their spaces as non-breaking ones)
    const said = (el: Element) => (el.textContent ?? '').replace(/\u00a0/g, ' ');
    const ok = (el: Element) =>
        (!texts.length || texts.some((t) => said(el).includes(t))) &&
        (!labels.length || labels.includes(el.getAttribute('label') ?? ''));
    const found: Element[] = [];
    const stack: ParentNode[] = [root];
    while (stack.length) {
        const scope = stack.pop()!;
        for (const el of scope.querySelectorAll(selector)) if (ok(el)) found.push(el);
        for (const el of scope.querySelectorAll('*')) if (el.shadowRoot) stack.push(el.shadowRoot);
    }
    return found;
}

const LIME = '#c3f240';

/** Light `target`; returns a function that takes the light away. */
export function spotlight(target: Highlight): () => void {
    const { selector, text, label, all = false, expand = false, pad = 6 } = typeof target === 'string' ? ({ selector: target } as Exclude<Highlight, string>) : target;
    const ring = document.createElement('div');
    ring.setAttribute('data-sinners-spotlight', '');
    Object.assign(ring.style, {
        position: 'fixed',
        zIndex: '2147483647',
        pointerEvents: 'none',
        // (a popover comes with a border, padding, a background and centring of its own)
        inset: 'auto',
        margin: '0',
        padding: '0',
        border: '0',
        background: 'transparent',
        overflow: 'visible',
        borderRadius: '10px',
        boxShadow: `0 0 0 4px ${LIME}, 0 0 26px 10px rgba(195, 242, 64, 0.75), 0 0 0 200vmax rgba(6, 11, 30, 0.55)`,
        opacity: '0',
        transition: 'opacity 0.35s ease-out, left 0.2s, top 0.2s, width 0.2s, height 0.2s',
    });
    let pulse: Animation | null = null;
    let warned = false;
    const opened = new WeakSet<Element>();
    const t0 = performance.now();

    function place() {
        const els = deepQueryAll(document, selector, text, label);
        if (expand) {
            // open it the way a click on its caret would (once: the presenter may close it again)
            for (const el of els) {
                if (opened.has(el) || el.hasAttribute('show-children')) continue;
                opened.add(el);
                el.shadowRoot?.querySelector<HTMLElement>('#caret-button')?.click();
            }
        }
        const rects = els
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && r.height > 0);
        const use = all ? rects : rects.slice(0, 1);
        if (!use.length) {
            if (!warned && performance.now() - t0 > 8000) {
                console.warn(`[SPOTLIGHT] nothing here matches "${selector}"`, { text, label });
                warned = true;
            }
            return;
        }
        // the part of the target that's on screen: a long list runs off the bottom, the ring doesn't
        const left = Math.max(Math.min(...use.map((r) => r.left)) - pad, 4);
        const top = Math.max(Math.min(...use.map((r) => r.top)) - pad, 4);
        const right = Math.min(Math.max(...use.map((r) => r.right)) + pad, window.innerWidth - 4);
        const bottom = Math.min(Math.max(...use.map((r) => r.bottom)) + pad, window.innerHeight - 4);
        if (right <= left || bottom <= top) return;
        if (!ring.isConnected) {
            document.body.appendChild(ring);
            try {
                ring.setAttribute('popover', 'manual');
                ring.showPopover();
            } catch { /* no popover API: it's still on top of everything but a modal */ }
        }
        Object.assign(ring.style, {
            left: `${left}px`,
            top: `${top}px`,
            width: `${right - left}px`,
            height: `${bottom - top}px`,
            opacity: '1',
        });
        // a slow breath, so the eye finds it (a big ring swells less than a small one)
        const swell = 1 + Math.min(0.08, 14 / Math.max(right - left, bottom - top));
        pulse ??= ring.animate([{ transform: 'scale(1)' }, { transform: `scale(${swell})` }, { transform: 'scale(1)' }], {
            duration: 1500,
            iterations: Infinity,
            easing: 'ease-in-out',
        });
    }
    place();
    const timer = setInterval(place, 200);

    return () => {
        clearInterval(timer);
        pulse?.cancel();
        ring.style.opacity = '0';
        setTimeout(() => ring.remove(), 400);
    };
}
