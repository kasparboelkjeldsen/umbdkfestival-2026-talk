// Mock mice for the talk: before a clicker step runs its fix, mouse pointers fly in and click the
// buttons a person would have clicked, several at once where the fix is several clicks. Nothing is
// really clicked (the step calls the same code the buttons do): this only shows a room that the fix
// is something the GUI lets you do, not a script behind a curtain.
//
// Each pointer wears a yellow halo (the "where is the mouse" ring of a screen recording) and leaves
// a ripple where it clicks; the thing it clicks flashes. They are drawn in the top layer, over
// everything, and take no input.

const MAX = 6; // more pointers than this is a swarm, not a demonstration
const YELLOW = '255, 221, 51';
const SIZE = 46; // the arrow, in px: read from the back of a room
const HALO = 92;

const ARROW = `<svg viewBox="0 0 24 24" width="${SIZE}" height="${SIZE}" aria-hidden="true" style="position:absolute;left:0;top:0;display:block;filter:drop-shadow(0 3px 5px rgba(0,0,0,.55))">
    <path d="M3 2 L3 19.4 L7.7 15.1 L10.8 21.9 L13.7 20.6 L10.7 14 L17 13.7 Z" style="fill:#fff;stroke:#111;stroke-width:1.5;stroke-linejoin:round"/>
</svg>`;
// where the arrow's tip is inside its box
const TIP = { x: (3 / 24) * SIZE, y: (2 / 24) * SIZE };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function visible(el: Element): DOMRect | undefined {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return undefined;
    if (r.bottom < 8 || r.top > innerHeight - 8 || r.right < 8 || r.left > innerWidth - 8) return undefined;
    return r;
}

/** The nearest ancestor that scrolls (through shadow roots), or undefined. */
function scroller(el: Element): Element | undefined {
    let n: Node | null = el;
    while (n) {
        // up the tree as it is drawn: into the slot an element is assigned to, out of a shadow root to its host
        n = (n instanceof Element ? n.assignedSlot : null) ?? n.parentNode ?? (n instanceof ShadowRoot ? n.host : null);
        if (n instanceof ShadowRoot) n = n.host;
        if (!(n instanceof Element)) continue;
        const oy = getComputedStyle(n).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 4) return n;
    }
    return undefined;
}

/**
 * Scroll `box` to `to`, eased, on a timer. Not `scrollTo({ behavior: 'smooth' })`: the browser runs
 * that on its frames, and a page that isn't being drawn at full rate (a window in the background, a
 * laptop that is busy projecting) got 21 px of a 5,000 px scroll and stopped.
 */
function glide(box: Element, to: number, ms = 480): Promise<void> {
    const from = box.scrollTop;
    const t0 = performance.now();
    return new Promise((done) => {
        const tick = () => {
            const k = Math.min(1, (performance.now() - t0) / ms);
            const eased = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
            box.scrollTop = from + (to - from) * eased;
            if (k < 1) setTimeout(tick, 16);
            else done();
        };
        tick();
    });
}

function layer(): HTMLElement {
    const el = document.createElement('div');
    Object.assign(el.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        margin: '0',
        padding: '0',
        border: '0',
        background: 'transparent',
        overflow: 'hidden',
        pointerEvents: 'none',
    });
    document.body.appendChild(el);
    try {
        // the top layer: above Umbraco's modals and the Board's own overlays
        el.setAttribute('popover', 'manual');
        el.showPopover();
    } catch { /* no popover API: still above everything but a modal */ }
    return el;
}

/** Pick up to `n` of `items`, spread evenly over the list (the first and the last among them). */
function spread<T>(items: T[], n: number): T[] {
    if (items.length <= n) return items;
    return Array.from({ length: n }, (_, i) => items[Math.round((i * (items.length - 1)) / (n - 1))]);
}

/**
 * Show pointers clicking `targets`. Resolves when the clicks have landed (the fix should start
 * then); the pointers linger a moment and leave by themselves. If none of the targets is on screen
 * the first one is scrolled into view first, and `restore()` of the result puts the scroll back.
 */
export async function clickShow(targets: Element[]): Promise<{ restore: () => void }> {
    const none = { restore: () => {} };
    let restore = none.restore;
    targets = targets.filter((t) => t.isConnected);
    if (!targets.length || document.hidden) return none;

    let shown = targets.filter(visible);
    if (!shown.length) {
        // Bring the first one to the middle of the box it scrolls in. By hand, never scrollIntoView:
        // that also scrolls every box outside this page, and the Board is shown framed in the talk's
        // deck, which went up with it.
        const box = scroller(targets[0]);
        if (!box) return none;
        const was = box.scrollTop;
        const r = targets[0].getBoundingClientRect();
        const b = box.getBoundingClientRect();
        const top = Math.max(b.top, 0);
        const bottom = Math.min(b.bottom, innerHeight);
        restore = () => void glide(box, was);
        await glide(box, was + r.top + r.height / 2 - (top + bottom) / 2);
        await wait(150);
        shown = targets.filter(visible);
        if (!shown.length) return { restore };
    }
    shown = spread(shown, MAX);

    const root = layer();
    let landed = 0;
    shown.forEach((target, i) => {
        const r = target.getBoundingClientRect();
        // a little off-centre, each differently: people don't hit the middle
        const tx = r.left + r.width * (0.5 + (((i * 37) % 21) - 10) / 100);
        const ty = r.top + r.height * (0.55 + (((i * 53) % 17) - 8) / 100);
        // they come from below, left and right in turn, from a few hundred px away
        const side = i % 2 ? -1 : 1;
        const angle = ((28 + ((i * 47) % 40)) * Math.PI) / 180;
        const dist = 380 + ((i * 97) % 180);
        const ox = Math.max(20, Math.min(innerWidth - 20, tx + side * Math.cos(angle) * dist));
        const oy = Math.min(innerHeight + 60, ty + Math.sin(angle) * dist);
        // a slight curve: a point off the straight line, halfway
        const mx = (ox + tx) / 2 + side * 46;
        const my = (oy + ty) / 2 - 30;

        const delay = i * 110;
        const travel = 640 + ((i * 71) % 220);
        landed = Math.max(landed, delay + travel);

        const mouse = document.createElement('div');
        mouse.style.cssText = `position:absolute;left:${-TIP.x}px;top:${-TIP.y}px;width:${SIZE}px;height:${SIZE}px;will-change:transform;opacity:0`;
        mouse.innerHTML = `
            <i style="position:absolute;left:${TIP.x - HALO / 2}px;top:${TIP.y - HALO / 2}px;width:${HALO}px;height:${HALO}px;box-sizing:border-box;border-radius:50%;background:rgba(${YELLOW},.3);border:3px solid rgba(${YELLOW},.95);box-shadow:0 0 18px 4px rgba(${YELLOW},.45)"></i>
            ${ARROW}`;
        root.appendChild(mouse);
        const at = (x: number, y: number, s = 1) => `translate(${x}px, ${y}px) scale(${s})`;
        mouse.animate(
            [
                { transform: at(ox, oy), opacity: 0, offset: 0 },
                { opacity: 1, offset: 0.12 },
                { transform: at(mx, my), offset: 0.5 },
                { transform: at(tx, ty), opacity: 1, offset: 1 },
            ],
            { duration: travel, delay, easing: 'cubic-bezier(0.3, 0.1, 0.2, 1)', fill: 'both' },
        );

        // the click: the pointer dips, the halo flashes, two ripples run out, the target lights up
        setTimeout(() => {
            mouse.animate([{ transform: at(tx, ty) }, { transform: at(tx, ty, 0.78) }, { transform: at(tx, ty) }], { duration: 220, easing: 'ease-out' });
            (mouse.firstElementChild as HTMLElement).animate(
                [{ background: `rgba(${YELLOW},.95)` }, { background: `rgba(${YELLOW},.3)` }],
                { duration: 380, easing: 'ease-out' },
            );
            for (const [k, late] of [0, 140].entries()) {
                const ripple = document.createElement('i');
                ripple.style.cssText = `position:absolute;left:${tx}px;top:${ty}px;width:40px;height:40px;margin:-20px 0 0 -20px;box-sizing:border-box;border-radius:50%;border:${k ? 3 : 5}px solid rgba(${YELLOW},1);opacity:0`;
                root.insertBefore(ripple, root.firstChild);
                ripple.animate(
                    [
                        { transform: 'scale(0.5)', opacity: 1 },
                        { transform: 'scale(4.6)', opacity: 0 },
                    ],
                    { duration: 620, delay: late, easing: 'cubic-bezier(0.1, 0.6, 0.3, 1)', fill: 'both' },
                );
            }
            (target as HTMLElement).animate(
                [
                    { outline: `4px solid rgba(${YELLOW},1)`, outlineOffset: '2px', filter: 'brightness(1.5)' },
                    { outline: `4px solid rgba(${YELLOW},0)`, outlineOffset: '10px', filter: 'none' },
                ],
                { duration: 520, easing: 'ease-out' },
            );
        }, delay + travel);
    });

    // gone a moment after the last click (the fix is already under way by then)
    setTimeout(() => {
        root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' });
        // (by the clock, not on the animation's finish: that waits for a frame to be drawn)
        setTimeout(() => root.remove(), 320);
    }, landed + 750);

    await wait(landed + 160);
    return { restore };
}
