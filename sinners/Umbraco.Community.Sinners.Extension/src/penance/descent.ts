// The fall: how the Penance Board goes from spotless to maximum sin in front of a room.
//
// The lights fail (the page flickers dark and red, and shakes), a wall of fire comes up from the
// bottom and covers everything, `turn()` is called behind it (the Board switches theme and shows
// its real numbers there), and the fire carries on up and off, leaving hell. About 2.3 s. Drawn in
// the top layer, over everything; takes no input; removes itself.

const FLICKER = 900; // the lights failing
const RISE = 520; // the fire coming up, overlapping the end of the flicker
const HOLD = 170; // everything is fire: the theme turns here
const LEAVE = 760; // the fire going on up

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** A row of flame tongues along the top of a sheet of fire, as a CSS mask. */
const tongues = (w: number, h: number) =>
    `radial-gradient(${w / 2}px ${h}px at 50% 100%, #000 98%, #0000 100%) 0 0 / ${w}px ${h}px repeat-x, linear-gradient(#000, #000) 0 ${h - 1}px / 100% 100% no-repeat`;

export async function descend(turn: () => void): Promise<void> {
    if (document.hidden) {
        turn();
        return;
    }
    const root = document.createElement('div');
    Object.assign(root.style, {
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
    root.innerHTML = `
        <div class="dark" style="position:absolute;inset:0;background:#000;opacity:0"></div>
        <div class="red" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 60%, #ff2a12 0%, #7a0500 55%, #1a0000 100%);mix-blend-mode:multiply;opacity:0"></div>
        <div class="fire back" style="position:absolute;left:-4%;width:108%;top:100%;height:190vh;
            background:linear-gradient(to top, #0000 0%, #1a0000 10%, #5a0803 42%, #b3200a 66%, #ff6a12 82%, #ffb02e 94%, #ffd45a 100%);
            -webkit-mask:${tongues(180, 240)};mask:${tongues(180, 240)}"></div>
        <div class="fire front" style="position:absolute;left:-9%;width:118%;top:100%;height:190vh;
            background:linear-gradient(to top, #0000 0%, #140000 14%, #6e0c04 46%, #d9360b 68%, #ff8a1e 80%, #ffd45a 92%, #ffe9a0 100%);
            -webkit-mask:${tongues(104, 180)};mask:${tongues(104, 180)}"></div>
        <div class="flash" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 70%, #fff3c4, #ff7a1a 60%, #c8140c);opacity:0"></div>`;
    document.body.appendChild(root);
    try {
        root.setAttribute('popover', 'manual');
        root.showPopover();
    } catch { /* no popover API: still above everything but a modal */ }
    const q = (sel: string) => root.querySelector<HTMLElement>(sel)!;

    // the lights fail: three stutters, each darker than the last
    const dim = [0, 0.55, 0.05, 0, 0.7, 0.15, 0.85, 0.1, 0.9, 0.35, 0.75];
    q('.dark').animate(dim.map((opacity) => ({ opacity })), { duration: FLICKER, easing: 'steps(1, end)', fill: 'forwards' });
    q('.red').animate([0, 0, 0.5, 0.2, 0.75, 0.4, 0.9, 0.6, 1, 1, 1].map((opacity) => ({ opacity })), { duration: FLICKER, easing: 'steps(1, end)', fill: 'forwards' });
    const shake = (px: number, ms: number) =>
        document.body.animate(
            Array.from({ length: 12 }, (_, i) => ({
                transform: i === 11 ? 'none' : `translate(${((i * 7919) % 11 - 5) * px * 0.2}px, ${((i * 6007) % 9 - 4) * px * 0.25}px)`,
            })),
            { duration: ms, easing: 'steps(12, end)' },
        );
    shake(5, FLICKER);

    await wait(FLICKER - 120);

    // the fire: up over everything, a breath, on up and away. (190 vh tall: at -100vh its tongues
    // are just off the top and its body covers the screen.)
    const total = RISE + HOLD + LEAVE;
    const up = (el: HTMLElement, lag: number) =>
        el.animate(
            [
                // (each keyframe's easing runs to the next one; the whole stays linear, so the times hold)
                { transform: 'translateY(0)', offset: 0, easing: 'cubic-bezier(0.35, 0, 0.45, 1)' },
                { transform: `translateY(${-118 + lag}vh)`, offset: RISE / total, easing: 'linear' },
                { transform: `translateY(${-124 + lag}vh)`, offset: (RISE + HOLD) / total, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)' },
                { transform: 'translateY(-300vh)', offset: 1 },
            ],
            { duration: total, fill: 'forwards' },
        );
    up(q('.back'), 0);
    up(q('.front'), 6);
    shake(16, total);

    // embers, ahead of the fire and after it
    for (let i = 0; i < 34; i++) {
        const e = document.createElement('i');
        const x = (i * 61) % 100;
        const size = 4 + ((i * 13) % 7);
        e.style.cssText = `position:absolute;left:${x}%;top:100%;width:${size}px;height:${size}px;border-radius:50%;background:#ffd45a;box-shadow:0 0 ${size * 2}px ${size / 2}px #ff6a12;opacity:0`;
        root.appendChild(e);
        e.animate(
            [
                { transform: 'translate(0, 0)', opacity: 0 },
                { opacity: 1, offset: 0.15 },
                { transform: `translate(${((i * 29) % 160) - 80}px, -${70 + ((i * 17) % 50)}vh)`, opacity: 0 },
            ],
            { duration: 1300 + ((i * 97) % 1100), delay: (i * 43) % 900, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' },
        );
    }

    await wait(RISE + HOLD * 0.4);
    // behind the fire: the lights that failed don't come back, the page is hell now
    q('.dark').getAnimations().forEach((a) => a.cancel());
    q('.red').getAnimations().forEach((a) => a.cancel());
    try {
        turn();
    } catch (e) {
        console.error('[DESCENT] the turn failed', e);
    }
    q('.flash').animate([{ opacity: 0 }, { opacity: 0.8, offset: 0.25 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' });

    await wait(HOLD * 0.6 + LEAVE + 900);
    root.remove();
}
