// Easter eggs for the talk: while the backoffice wears one of the Abyss themes (a sin level above
// zero), the rest of Umbraco is a little possessed too. Nothing here changes data or Umbraco's own
// elements for good: every swap is put back, every overlay is ours, and at sin level 0 it all stops.
//
//   welcome   the "Welcome to Umbraco" dashboard in Content: its news cards turn, one after the
//             other, into darker versions of themselves (the pawn that ran out of options, the
//             webinar stage its speaker has walked off, the keynote with empty stools, the community
//             photo with a rabbit that has seen things), and stay that way. Umbraco's news feed
//             decides which cards there are; a picture card we have no version of goes dark and says so.
//             With the talk's clicker driving, each card turns on a press that was meant to light the
//             exhibit's spotlight: the page refuses ("NO", for a moment, where every word was) and
//             turns a card instead. Three refusals, then the press gets its spotlight (refuse())
//   whispers  names in the trees flicker into something else for a moment (Recycle Sin, Tongues…)
//   buttons   so do a few buttons (Save and perish)
//   avatar    the user's initial in the header shakes, swells and turns into a glowing pentagram
//             (and back into a letter when the last sin is absolved)
//   ghost     in a view that walks the tree, a comment types itself at the end of the sinful lines
//
// To switch one off: set it to false in EGGS. To switch them all off without a build:
// localStorage.setItem('sinners-eggs', 'off') in the backoffice. To remove them: delete this file
// and the haunt() line in index.ts.
import { UMB_THEME_CONTEXT } from '@umbraco-cms/backoffice/themes';
import type { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { deepQueryAll } from './spotlight.js';

const EGGS = { welcome: true, whispers: true, buttons: true, avatar: true, ghost: true };

let level = 0;
const off = () => {
    try {
        return localStorage.getItem('sinners-eggs') === 'off';
    } catch {
        return false;
    }
};

export function haunt(host: Parameters<UmbEntryPointOnInit>[0]): void {
    host.consumeContext(UMB_THEME_CONTEXT, (ctx) => {
        if (!ctx) return;
        host.observe(
            ctx.theme,
            (alias) => {
                const m = /^sinners-spooky-(\d+)$/.exec(alias ?? '');
                level = m ? +m[1] : 0;
            },
            'sinnersHaunt',
        );
    });
    setInterval(() => {
        if (document.hidden) return;
        const on = level > 0 && !off();
        const path = location.pathname;
        if (EGGS.welcome && path.includes('/section/content')) welcome(on);
        if (EGGS.avatar) avatar(on);
        if (EGGS.ghost && /\/(partial-view|template)\//.test(path)) ghost(on);
        if (on && EGGS.whispers) whisper();
        if (on && EGGS.buttons) buttons();
    }, 200);
}

// ------------------------------------------------------------------------------------ whispers

/** Tree names and what they turn into. (Never the ones the exhibits' spotlights look for by name.) */
const WHISPERS: Record<string, string> = {
    'Recycle Bin': 'Recycle Sin',
    'Log Viewer': 'Sin Viewer',
    Relations: 'Blood Relations',
    Webhooks: 'Meathooks',
    Languages: 'Tongues',
    Scripts: 'Scriptures',
    Stylesheets: 'Shroud Sheets',
    Templates: 'Temples',
    'Partial Views': 'Partial Damnation',
    'Member Types': 'Dismember Types',
    'Media Types': 'Séance Types',
    'Document Blueprints': 'Doom Blueprints',
    'Extension Insights': 'Extinction Insights',
    'Date Picker': 'Doomsday Picker',
    'Date Picker with time': 'Doomsday Picker with time left',
    'Richtext editor': 'Witchtext editor',
    'Member Picker': 'Soul Picker',
    'Content Picker': 'Coffin Picker',
    'Media Picker': 'Séance Picker',
    'True/false': 'True/false/damned',
    Tags: 'Toe Tags',
    Textarea: 'Hexarea',
    Textstring: 'Hexstring',
    Numeric: 'Numeric (666)',
    'Checkbox list': 'Hexbox list',
    Dropdown: 'Dropdead',
    Radiobox: "Pandora's Radiobox",
    'Image Cropper': 'Image Reaper',
    'Upload File': 'Upload Soul',
    'Approved Color': 'Approved Color: Blood',
    'Sample Images': 'Sample Omens',
    'Social Icons': 'Antisocial Icons',
    'Form submissions': 'Form submissions (all 600)',
    'XML Sitemap': 'XML Sitemap of Hell',
    Error: 'Terror',
    Search: 'Seek',
    Paging: 'Raging',
    Footer: 'Cloven Footer',
};

type Labelled = Element & { label?: string };
const whispering = new Set<Element>();
let lastWhisper = 0;

function whisper() {
    const now = performance.now();
    // one every 4 s at level 1, one every 1.2 s at level 10
    if (now - lastWhisper < 4300 - level * 310) return;
    const candidates = (deepQueryAll(document, 'uui-menu-item') as Labelled[]).filter((el) => {
        if (whispering.has(el) || !(el.getAttribute('label')! in WHISPERS)) return false;
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    });
    if (!candidates.length) return;
    lastWhisper = now;
    const el = candidates[Math.floor(Math.random() * candidates.length)];
    const was = el.getAttribute('label')!;
    const to = WHISPERS[was];
    // the property, not the attribute: Umbraco's own template (and the spotlights) keep the real name
    whispering.add(el);
    el.label = to;
    setTimeout(
        () => {
            if (el.label === to) el.label = el.getAttribute('label') ?? was;
            whispering.delete(el);
        },
        900 + level * 140,
    );
}

// ------------------------------------------------------------------------------------ buttons

const BUTTONS: Record<string, string> = {
    'Save and publish': 'Save and perish',
    'Save and preview': 'Save and repent',
    Save: 'Save us',
    Create: 'Summon',
};
let lastButton = 0;

/** The first text node directly in `el` that says `text`. */
function textNode(el: Element, text: string): Text | undefined {
    for (const n of el.childNodes) if (n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim() === text) return n as Text;
    return undefined;
}

/**
 * Make a uui-button say something else; returns how to put it back. A button says its `label`
 * unless it has text of its own, so it's the property (the attribute keeps the real one) or the text node.
 */
function relabel(el: Labelled, to: string): (() => void) | undefined {
    const said = (el.textContent ?? '').trim();
    const node = said ? textNode(el, said) : undefined;
    if (node) {
        const was = node.data;
        node.data = to;
        return () => {
            if (node.data === to) node.data = was;
        };
    }
    if (said || !el.getAttribute('label')) return undefined;
    el.label = to;
    return () => {
        if (el.label === to) el.label = el.getAttribute('label') ?? '';
    };
}

function buttons() {
    const now = performance.now();
    if (now - lastButton < 9000 - level * 500) return;
    for (const el of deepQueryAll(document, 'uui-button') as Labelled[]) {
        const to = BUTTONS[(el.textContent ?? '').trim() || (el.getAttribute('label') ?? '')];
        if (!to || whispering.has(el) || el.getBoundingClientRect().height === 0) continue;
        const back = relabel(el, to);
        if (!back) continue;
        lastButton = now;
        whispering.add(el);
        setTimeout(() => {
            back();
            whispering.delete(el);
        }, 1500 + level * 150);
        return;
    }
}

// ------------------------------------------------------------------------------------ welcome

// The reveal is staged, so a room notices it: the dashboard arrives as Umbraco made it and sits
// there for a beat; then the first card stutters and turns, then the second (the pawn drops), then
// the photo goes dark, and last of all the rabbit opens its eyes. About ten seconds, once per
// demo run: a later visit to the dashboard finds it already turned (it never went back).
const BEAT = 2400; // the dashboard as it should be, before anything happens
const GAP = 2300; // from one card turning to the next
const EYES = 2600; // after the photo starts to darken
const SEEN_KEY = 'sinners-welcome-seen'; // sessionStorage: cleared with the clicker's state ('0', the deck's R)
const DRIVEN_KEY = 'sinners-presenter-state'; // the clicker's own state: when it's there, the clicker drives the reveal
const NO_FOR = 900; // ms the page says NO
const seen = () => {
    try {
        return sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
        return false; // then it's a first time every time
    }
};
const driven = () => {
    try {
        return sessionStorage.getItem(DRIVEN_KEY) != null;
    } catch {
        return false;
    }
};

interface Possession {
    /** part of the card image's URL (Umbraco's news feed decides what the cards are) */
    match: string;
    title: string;
    text: string;
    button: string;
    /** what goes over the picture */
    over: string;
    /** the picture stays and goes dark, slowly (a photo of people: nobody in it is redrawn) */
    photo?: boolean;
}

// Embers where the confetti was: a handful of flakes, each falling at its own pace
const EMBERS = Array.from({ length: 28 }, (_, i) => {
    const x = (i * 83 + 17) % 600;
    const w = 4 + (i % 3);
    const fill = i % 3 ? '#ff7a1a' : '#ffd24a';
    return `<rect class="e" x="${x}" y="-8" width="${w}" height="3" fill="${fill}" style="animation-delay:${(-(i * 0.43) % 4).toFixed(2)}s;animation-duration:${(2.6 + (i % 5) * 0.55).toFixed(2)}s"/>`;
}).join('');
const STOOL = (x: number) => `
    <g transform="translate(${x} 0)" fill="#0b0b0f" stroke="#ff5a1f" stroke-opacity="0.45" stroke-width="1.2">
        <path d="M17 119 v-27 h8 v30 z"/>
        <rect x="-24" y="118" width="48" height="9" rx="4"/>
        <rect x="-3" y="127" width="6" height="74"/>
        <path d="M-17 170 h34" fill="none" stroke-width="3"/>
        <ellipse cx="0" cy="204" rx="24" ry="5"/>
    </g>`;

// The order is the order they turn in. The feed changes (it did, two days before the talk): a card
// that is no longer in it is simply never found, and a picture card we have never seen gets UNKNOWN.
const POSSESSIONS: Possession[] = [
    {
        match: 'g2',
        title: 'Write an honest review. Or else.',
        text: 'When you review Umbraco, we read every single review. Every. Single. One. We know which backoffice it came from. We know what is in its root.',
        button: 'Review us. Now.',
        over: `
            <div class="crave">
                <div class="badge"><i></i><b>Users<br>CRAVE<br>Us</b></div>
                <p><strong>You will learn to love us too.</strong><span>…there is no gift card</span></p>
            </div>`,
    },
    {
        match: 'umbraco-13',
        title: 'Umbraco 13 has reached its end.',
        text: 'It was told to discover its options. It did not discover them in time. After December 14, 2026, nobody patches it. Nobody visits.',
        button: 'There are no options',
        // a game of hangman, lost: the beam, the rope, the pawn
        over: `
            <svg class="gallows" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                    <radialGradient id="sky" cx="50%" cy="38%" r="75%">
                        <stop offset="0" stop-color="#5a0f0a"/><stop offset="1" stop-color="#0c0202"/>
                    </radialGradient>
                    <linearGradient id="wood" x1="0" x2="1"><stop offset="0" stop-color="#6b4a2c"/><stop offset="1" stop-color="#3a2614"/></linearGradient>
                </defs>
                <rect width="600" height="300" fill="url(#sky)"/>
                <g fill="url(#wood)" stroke="#1c1108" stroke-width="2">
                    <rect x="150" y="262" width="230" height="16"/>
                    <rect x="186" y="34" width="18" height="230"/>
                    <rect x="186" y="34" width="190" height="16"/>
                    <path d="M204 96 L250 50 L262 50 L204 110 Z"/>
                </g>
                <g class="drop"><g class="swing">
                    <line x1="346" y1="-80" x2="346" y2="128" stroke="#c9b48a" stroke-width="5"/>
                    <ellipse cx="346" cy="152" rx="15" ry="6" fill="none" stroke="#c9b48a" stroke-width="5"/>
                    <g fill="#2a3fa0" stroke="#111a4d" stroke-width="2">
                        <circle cx="346" cy="128" r="21"/>
                        <path d="M333 150 L359 150 L372 216 L320 216 Z"/>
                        <rect x="312" y="214" width="68" height="13" rx="6"/>
                    </g>
                    <path d="M338 123 l8 8 m0 -8 l-8 8 M350 123 l8 8 m0 -8 l-8 8" stroke="#0b0f2a" stroke-width="3" stroke-linecap="round"/>
                </g></g>
                <g fill="url(#wood)" stroke="#1c1108" stroke-width="2">
                    <rect x="452" y="226" width="96" height="52"/>
                    <rect x="470" y="182" width="70" height="46"/>
                </g>
                <g fill="#2a3fa0" stroke="#111a4d" stroke-width="2">
                    <circle cx="505" cy="140" r="15"/>
                    <path d="M496 154 L514 154 L522 182 L488 182 Z"/>
                </g>
            </svg>`,
    },
    {
        // A webinar card with its speaker on it. He is not redrawn, darkened or given eyes: in the
        // turned version he simply isn't there. The stage is (its rings, the light still on his
        // spot, the clicker he put down), and somebody has written on the wall.
        match: 'cloud-webinar',
        title: 'The Umbraco Cloud Webinar has lost its speaker',
        text: 'He was right here. He saw what you keep in your root, put down the clicker, and left. He is fine. He is the only one who is. The live Q&A goes ahead. Nobody answers.',
        button: 'Find him',
        over: `
            <svg class="gone" viewBox="0 0 600 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                    <radialGradient id="dim" cx="34%" cy="100%" r="95%">
                        <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/>
                    </radialGradient>
                    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#ffe9c2" stop-opacity="0.36"/><stop offset="1" stop-color="#ffe9c2" stop-opacity="0.05"/>
                    </linearGradient>
                </defs>
                <rect width="600" height="230" fill="#070817"/>
                <g transform="translate(205 262)">
                    <circle r="400" fill="#3d3542"/><circle r="330" fill="#0b0d26"/><circle r="268" fill="#64262c"/>
                    <circle r="205" fill="#0b0d26"/><circle r="150" fill="#1b2460"/><circle r="92" fill="#05060f"/>
                </g>
                <rect width="600" height="230" fill="url(#dim)"/>
                <g fill="#f4f1ea" font-family="Lato, sans-serif" font-size="21">
                    <text x="38" y="66">From Running</text><text x="38" y="93">Projects to</text><text x="38" y="120">Running Away</text>
                </g>
                <path d="M456 -10 L370 214 L542 214 Z" fill="url(#cone)"/>
                <ellipse cx="456" cy="214" rx="86" ry="10" fill="#ffe9c2" opacity="0.24"/>
                <g class="clicker"><g transform="translate(486 208) rotate(-14)">
                    <rect x="-17" y="-5" width="34" height="10" rx="5" fill="#15161c" stroke="#5a5c6e"/>
                    <circle cx="8" r="2.4" fill="#ff2a12"/>
                </g></g>
                <g class="scrawl" transform="rotate(-5 460 100)">
                    <text class="l1" x="338" y="84" textLength="236" lengthAdjust="spacingAndGlyphs">WHERE DID</text>
                    <text class="l2" x="372" y="132" textLength="164" lengthAdjust="spacingAndGlyphs">HE GO?</text>
                </g>
            </svg>`,
    },
    {
        // The keynote's three hosts with their confetti: in the turned version the stools are
        // empty, the curtains are the wrong colour and what falls is not confetti.
        match: 'winter-keynote',
        title: 'Winter is cancelled in 2027 🔥',
        text: "Join our Winter Keynote, live from down here on Tuesday 2 February 2027 at 16:30 CET. It will not be winter. Get news, live demos and our roadmap. The road goes one way. Can't make it live? You will.",
        button: 'Save your soul',
        over: `
            <svg class="stools" viewBox="0 0 600 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                    <linearGradient id="drape" x1="0" x2="1">
                        <stop offset="0" stop-color="#2c0707"/><stop offset="0.5" stop-color="#641611"/><stop offset="1" stop-color="#2c0707"/>
                    </linearGradient>
                    <pattern id="curtain" width="27" height="230" patternUnits="userSpaceOnUse"><rect width="27" height="230" fill="url(#drape)"/></pattern>
                    <radialGradient id="pit" cx="62%" cy="105%" r="80%">
                        <stop offset="0" stop-color="#ff5a1f" stop-opacity="0.6"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <rect width="600" height="184" fill="url(#curtain)"/>
                <rect y="184" width="600" height="46" fill="#120404"/>
                <ellipse cx="390" cy="212" rx="250" ry="18" fill="#3b0d0d"/>
                <rect width="600" height="230" fill="url(#pit)"/>
                <text class="neon" x="44" y="62">it's warm here</text>
                ${STOOL(300)}${STOOL(400)}${STOOL(500)}
                <g transform="translate(232 206) rotate(8)"><rect x="-22" y="-5" width="44" height="10" rx="2" fill="#16161b" stroke="#ffd24a" stroke-opacity="0.6"/></g>
                <g class="embers">${EMBERS}</g>
            </svg>`,
    },
    {
        match: 'one-story-community',
        photo: true,
        title: 'Be part of the Umbraco Community. Forever.',
        text: 'The Umbraco Community is at the heart of everything we do. There is a place for you here. There has always been a place for you here. Ready to join in? You already have.',
        button: 'Join us',
        // the eyes sit on the rabbit: placed by eye on this very photo
        over: `<div class="vignette"></div><i class="eye" style="left:56.15%;top:31.1%"></i><i class="eye" style="left:57.45%;top:31.1%"></i>`,
    },
];

/** The card with the rabbit: the last to turn, and the one whose eyes open. */
const RABBIT = 'one-story-community';

// A picture card the feed has that we have never seen (it changes without notice): the picture goes
// dark and the card says so itself. Nothing is drawn on whoever is in it.
const UNKNOWN: Possession = {
    match: '',
    photo: true,
    title: 'This card is new.',
    text: 'It arrived after the others. There was no time to curse it properly. Consider it cursed.',
    button: 'Fine',
    over: `<div class="vignette"></div>`,
};

/** The order the cards turn in: as listed, a card we don't know just before the rabbit. */
const rank = (p: Possession) => (p === UNKNOWN ? POSSESSIONS.length - 1.5 : POSSESSIONS.indexOf(p));

const STYLE = `
    .card { position: relative; }
    .sinners-over {
        position: absolute; left: 0; top: 0; width: 100%; overflow: hidden; container-type: inline-size;
        opacity: 0; pointer-events: none; border-radius: 16px 16px 0 0;
    }
    /* it stutters between the two before it settles: that's what makes a room look */
    .card.possessed .sinners-over { animation: sinners-in 1s steps(1, end) both; }
    .card.possessed.at-once .sinners-over { animation: none; opacity: 1; }
    @keyframes sinners-in {
        0% { opacity: 0; } 8% { opacity: 1; } 16% { opacity: 0; } 30% { opacity: 1; } 38% { opacity: 0; }
        52% { opacity: 0.9; } 60% { opacity: 0.15; } 74%, 100% { opacity: 1; }
    }
    /* (an emoji the feed's editors pasted in as a picture) */
    .card.possessed .card-text img { display: none; }
    .card-title { transition: color 0.3s; }
    .card.possessed .card-title { color: #e64241; }
    .card.possessed:not(.at-once) .card-title { animation: sinners-shiver 0.45s steps(2, end) 2; }
    @keyframes sinners-shiver { 0% { transform: translateX(-4px); } 50% { transform: translateX(4px); } 100% { transform: none; } }

    .crave { position: absolute; inset: 0; display: flex; align-items: center; gap: 6%; padding: 0 7%;
        background: radial-gradient(circle at 70% 40%, #7a120c, #1a0303 75%); color: #fff; }
    .crave .badge { flex: none; width: 30%; aspect-ratio: 0.82; background: #f3ece2; color: #160303;
        clip-path: polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%); transform: rotate(-11deg);
        display: grid; place-items: center; align-content: center; gap: 4%; text-align: center; }
    .crave .badge i { width: 22%; aspect-ratio: 1; border-radius: 50%; background: #c8140c; box-shadow: 0 0 12px #c8140c; }
    .crave .badge b { font: 900 clamp(18px, 4.6cqw, 54px)/0.98 Lato, sans-serif; letter-spacing: -0.01em; }
    .crave p { margin: 0; display: grid; gap: 0.5em; }
    .crave strong { font: 700 clamp(22px, 5.4cqw, 64px)/1.08 Lato, sans-serif; text-shadow: 0 0 18px #ff3b1f; }
    .crave span { font: 400 clamp(13px, 2.6cqw, 30px)/1.2 Lato, sans-serif; opacity: 0.8; }

    .gallows { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    /* the pawn drops once the picture has settled, jerks, and swings */
    .gallows .drop { transform: translateY(-260px); }
    .card.possessed .gallows .drop { animation: sinners-drop 0.5s cubic-bezier(0.6, 0, 0.9, 0.5) 1s both; }
    .card.possessed.at-once .gallows .drop { animation: none; transform: none; }
    @keyframes sinners-drop { 0% { transform: translateY(-260px); } 78% { transform: translateY(10px); } 100% { transform: none; } }
    .gallows .swing { transform-origin: 346px 50px; animation: sinners-swing 3.4s ease-in-out infinite; }
    @keyframes sinners-swing { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }

    .gone, .stools { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    /* the clicker lands once the picture has settled; then the writing, a line at a time */
    .gone .clicker { transform: translateY(-240px); }
    .card.possessed .gone .clicker { animation: sinners-clicker 0.55s cubic-bezier(0.6, 0, 0.9, 0.5) 1s both; }
    .card.possessed.at-once .gone .clicker { animation: none; transform: none; }
    @keyframes sinners-clicker { 0% { transform: translateY(-240px); } 70% { transform: none; } 84% { transform: translateY(-9px); } 100% { transform: none; } }
    .gone .scrawl text { font: 700 44px 'Segoe Script', 'Bradley Hand', 'Chalkduster', 'Comic Sans MS', cursive; fill: #ff3b24;
        filter: drop-shadow(0 0 5px rgba(255, 40, 10, 0.85)); opacity: 0; }
    .card.possessed .gone .scrawl .l1 { animation: sinners-scrawl 0.5s steps(3, end) 1.7s both; }
    .card.possessed .gone .scrawl .l2 { animation: sinners-scrawl 0.5s steps(3, end) 2.4s both; }
    .card.possessed.at-once .gone .scrawl text { animation: none; opacity: 1; }
    @keyframes sinners-scrawl { 0% { opacity: 0; } 40% { opacity: 0.9; } 60% { opacity: 0.3; } 100% { opacity: 1; } }

    .stools .neon { font: 700 30px 'Segoe Script', 'Bradley Hand', 'Comic Sans MS', cursive; fill: #ff8a5c;
        filter: drop-shadow(0 0 6px #ff3b1f); animation: sinners-neon 3.1s steps(1, end) infinite; }
    @keyframes sinners-neon { 0%, 61%, 65%, 100% { opacity: 1; } 62%, 64% { opacity: 0.25; } 88% { opacity: 0.6; } }
    .stools .e { animation: sinners-ember 3s linear infinite; }
    @keyframes sinners-ember { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(-26px, 250px); opacity: 0.25; } }

    /* the photo doesn't stutter: it goes dark, slowly, and then the eyes */
    .card-img { transition: filter 1.8s ease-in; }
    .card.at-once .card-img { transition: none; }
    .card.possessed.scary .card-img { filter: grayscale(0.85) sepia(0.6) hue-rotate(-28deg) saturate(1.9) contrast(1.35) brightness(0.5); }
    .card.scary .sinners-over { animation: none !important; opacity: 1; }
    .vignette { position: absolute; inset: 0; box-shadow: inset 0 0 70px 22px #1a0000; opacity: 0; transition: opacity 1.8s ease-in; }
    .card.possessed .vignette { opacity: 1; }
    .eye { position: absolute; width: 0.42%; aspect-ratio: 1; margin: -0.21% 0 0 -0.21%; border-radius: 50%;
        background: #ff2a12; box-shadow: 0 0 5px 2px #ff2a12, 0 0 14px 5px rgba(255, 30, 0, 0.75); opacity: 0; }
    .card.eyes .eye { animation: sinners-ignite 0.7s ease-out both, sinners-eye 2.6s ease-in-out 0.7s infinite; }
    @keyframes sinners-ignite { 0% { opacity: 0; transform: scale(0.2); } 35% { opacity: 1; transform: scale(3.2); } 100% { opacity: 1; transform: none; } }
    @keyframes sinners-eye { 0%, 46%, 54%, 100% { opacity: 1; } 50% { opacity: 0.1; } }
`;

interface Held {
    card: HTMLElement;
    img: HTMLImageElement;
    over: HTMLElement;
    is: Possession;
    /** [text node, what it said, what it says when possessed] */
    words: Array<[Text, string, string]>;
    button?: Labelled;
    unbutton?: () => void;
    on: boolean;
}
const held = new WeakMap<Element, Held | null>();

/** Take hold of a news card (once): our stylesheet, our overlay, and where its words are. */
function hold(host: Element): Held | null {
    if (held.has(host)) return held.get(host)!;
    const root = host.shadowRoot;
    const card = root?.querySelector<HTMLElement>('.card');
    const img = root?.querySelector<HTMLImageElement>('img.card-img');
    if (!root || !card || !img) {
        // (a card without a picture: left alone)
        if (root && card) held.set(host, null);
        return null;
    }
    const is = POSSESSIONS.find((p) => img.src.includes(p.match)) ?? UNKNOWN;
    const style = document.createElement('style');
    style.textContent = STYLE;
    root.appendChild(style);
    const over = document.createElement('div');
    over.className = 'sinners-over';
    over.innerHTML = is.over;
    card.appendChild(over);

    const words: Held['words'] = [];
    const first = (el: Element | null | undefined) => {
        const walker = el && document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let n: Node | null;
        while (walker && (n = walker.nextNode())) if (n.nodeValue?.trim()) return n as Text;
        return undefined;
    };
    const title = first(root.querySelector('.card-title'));
    const text = first(root.querySelector('.card-text'));
    if (title) words.push([title, title.data, is.title]);
    if (text) words.push([text, text.data, is.text]);
    // whatever else the card says after that (a second paragraph) goes quiet while it is turned
    const rest = document.createTreeWalker(root.querySelector('.card-text') ?? document.createElement('i'), NodeFilter.SHOW_TEXT);
    let more: Node | null;
    while ((more = rest.nextNode())) if (more !== text && more.nodeValue?.trim()) words.push([more as Text, (more as Text).data, '']);

    const h: Held = { card, img, over, is, words, button: root.querySelector<Labelled>('uui-button') ?? undefined, on: false };
    held.set(host, h);
    return h;
}

function possess(h: Held, on: boolean, atOnce: boolean, wordsAfter?: number) {
    // the overlay covers the picture exactly, whatever size the card is now
    if (on) h.over.style.height = `${h.img.offsetHeight}px`;
    if (h.on === on) return;
    h.on = on;
    const scary = !!h.is.photo;
    h.card.classList.toggle('at-once', on && atOnce);
    h.card.classList.toggle('scary', scary);
    h.card.classList.toggle('possessed', on);
    if (!on) h.card.classList.remove('eyes');
    // the words turn as the stutter settles (the photo's, as it darkens)
    const turn = () => {
        if (h.on !== on) return;
        for (const [node, was, cursed] of h.words) node.data = on ? cursed : was;
        if (on) h.unbutton = h.button && relabel(h.button, h.is.button);
        else h.unbutton?.();
    };
    if (on && !atOnce) setTimeout(turn, wordsAfter ?? (scary ? 900 : 700));
    else turn();
}

/** When the dashboard's cards were all there with their pictures (the reveal counts from then). */
let born = 0;
let bornFor: Element | undefined;

function welcome(on: boolean) {
    const cards = deepQueryAll(document, 'umb-news-card');
    const mine = cards.map(hold).filter((h): h is Held => !!h);
    if (!mine.length) return;
    if (!on) {
        for (const h of mine) possess(h, false, true);
        return;
    }
    // not before the pictures are in: the room should see the dashboard as Umbraco made it first
    if (!mine.every((h) => h.img.complete && h.img.naturalWidth > 0)) return;
    const now = performance.now();
    if (bornFor !== mine[0].card) {
        bornFor = mine[0].card;
        born = now;
    }
    const again = seen();
    if (!again && driven()) {
        // the clicker turns them, one refusal at a time (refuse()); only keep the turned ones fitted
        for (const h of mine) if (h.on) possess(h, true, false);
        return;
    }

    const order = [...mine].sort((a, b) => rank(a.is) - rank(b.is));
    order.forEach((h, k) => {
        const at = again ? 500 + k * 200 : BEAT + k * GAP;
        const t = now - born - at;
        if (t < 0) return;
        possess(h, true, again);
        // the last one is the punchline (the rabbit, when the feed has it: then its eyes open)
        if (k === order.length - 1 && t >= (again ? 300 : EYES)) {
            if (h.is.match === RABBIT) h.card.classList.add('eyes');
            try {
                sessionStorage.setItem(SEEN_KEY, '1'); // the punchline has landed
            } catch { /* fine */ }
        }
    });
}

// ------------------------------------------------------------------------------------ the refusals

let lastRefusal = 0;
// The talk's script has three refusals, however many picture cards the feed has that day: the first
// two presses turn a card each, the third turns everything that is left.
const REFUSALS = 3;
let refusals = 0;
let refusalsFor: Element | undefined;

/**
 * The clicker pressed for the spotlight on the Welcome dashboard. While there is a card left to turn
 * the page refuses: it says NO, turns the next card (the pawn, then the stage its speaker has left,
 * then the rest at once: the keynote without its hosts, the photo and its rabbit), and this returns
 * true, so the press does nothing else. With no card left (or none to begin with: no news, no
 * pictures, eggs off, no sin) it returns false and the press lights the spotlight.
 */
export function refuse(): boolean {
    if (!EGGS.welcome || level <= 0 || off() || !location.pathname.includes('/section/content') || seen()) return false;
    const mine = deepQueryAll(document, 'umb-news-card')
        .map(hold)
        .filter((h): h is Held => !!h && h.img.complete && h.img.naturalWidth > 0)
        .sort((a, b) => rank(a.is) - rank(b.is));
    const left = mine.filter((h) => !h.on);
    if (!left.length) return false;
    const now = performance.now();
    if (now - lastRefusal < 600) return true; // a double click isn't two refusals
    lastRefusal = now;
    if (refusalsFor !== mine[0].card) {
        // (the page was loaded again: its cards are as Umbraco made them, so the count starts over)
        refusalsFor = mine[0].card;
        refusals = 0;
    }
    refusals++;
    const turning = refusals >= REFUSALS ? left : left.slice(0, 1);

    sayNo();
    turning.forEach((h, k) => {
        // one after the other, a beat apart; their words turn once the page has stopped saying NO
        const after = k * 380;
        setTimeout(() => possess(h, true, false, Math.max(700, NO_FOR + 150 - after)), after);
    });
    if (turning.length === left.length) {
        // that was the last of them: the rabbit (if the feed has it) opens its eyes
        setTimeout(() => {
            for (const h of turning) if (h.is.match === RABBIT) h.card.classList.add('eyes');
            try {
                sessionStorage.setItem(SEEN_KEY, '1'); // a later visit finds them turned
            } catch { /* fine */ }
        }, 1500 + (turning.length - 1) * 380);
    }
    return true;
}

/** For a moment, everything the page says is NO: every text on it, and a red jolt. */
function sayNo() {
    const swapped: Array<[Text, string, string]> = [];
    const walk = (root: Node) => {
        for (const n of root.childNodes) {
            if (n.nodeType === Node.TEXT_NODE) {
                const text = n as Text;
                const said = text.data.trim();
                if (said.length < 2) continue;
                const parent = text.parentElement;
                if (parent && parent.getClientRects().length === 0) continue; // not drawn
                // as many NOs as it had to say (a name: one, a paragraph: a dozen)
                const words = said.split(/\s+/).length;
                const no = Array(Math.min(12, Math.ceil(words / 2))).fill('NO').join(' ') + (words > 3 ? '.' : '');
                swapped.push([text, text.data, no]);
            } else if (n.nodeType === Node.ELEMENT_NODE) {
                const el = n as Element;
                if (/^(STYLE|SCRIPT|TEMPLATE|TEXTAREA|SVG|svg|CODE|NOSCRIPT)$/.test(el.tagName)) continue;
                if (el.classList.contains('view-lines')) continue; // a code editor's text is the editor's
                if (el.shadowRoot) walk(el.shadowRoot);
                walk(el);
            }
        }
    };
    walk(document.body);
    for (const [text, , no] of swapped) text.data = no;
    setTimeout(() => {
        // (only what still says NO: a text that changed meanwhile has its own new words)
        for (const [text, was, no] of swapped) if (text.data === no) text.data = was;
    }, NO_FOR);

    document.body.animate(
        [0, -14, 12, -9, 7, -4, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 420, easing: 'ease-out' },
    );
    const jolt = document.createElement('div');
    jolt.style.cssText =
        'position:fixed;inset:0;width:100vw;height:100vh;margin:0;padding:0;border:0;pointer-events:none;' +
        'background:radial-gradient(circle at 50% 50%, rgba(200,20,12,0) 35%, rgba(200,20,12,0.55) 100%)';
    document.body.appendChild(jolt);
    try {
        jolt.setAttribute('popover', 'manual');
        jolt.showPopover();
    } catch { /* fine */ }
    jolt.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 0 }], { duration: NO_FOR, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => jolt.remove(), NO_FOR + 60);
}

// ------------------------------------------------------------------------------------ avatar

// The round "A" at the top right is on every page of the demo, and it is 32 px: for a room to see
// it turn, it has to move. So the first time (per demo run) it waits for people to have read the
// page, then shakes, swells to more than twice its size, becomes a pentagram at the peak, and
// settles a little larger than it was, glowing. Every later page finds it already turned, with a
// small shudder now and then. At sin level 0 it is a letter again.
const AVATAR_BEAT = 5000; // on the first page: before anything happens
const AVATAR_KEY = 'sinners-avatar-turned'; // sessionStorage: cleared with the clicker's state
const RED = '255, 42, 18';
const PENTAGRAM = `<svg class="sinners-pentagram" viewBox="0 0 32 32" aria-hidden="true"
    style="position:absolute;inset:0;width:100%;height:100%;display:block;border-radius:50%">
    <circle cx="16" cy="16" r="15.2" fill="#140303"/>
    <circle cx="16" cy="16" r="13.4" fill="none" stroke="rgb(${RED})" stroke-width="1.5"/>
    <path d="M16 28.5 L8.65 5.89 L27.89 19.86 L4.11 19.86 L23.35 5.89 Z" fill="none" stroke="rgb(${RED})" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

let face: HTMLElement | undefined;
let faceSeen = 0;
let faceLooked = 0;
let turned = false;
let turning = false;
let glow: Animation | undefined;
let lastShudder = 0;

function wear(el: HTMLElement) {
    if (!el.querySelector('.sinners-pentagram')) el.insertAdjacentHTML('beforeend', PENTAGRAM);
    el.style.color = 'transparent'; // the letter under it
    el.style.borderRadius = '50%';
    el.style.zIndex = '10';
    el.style.transform = 'scale(1.35)';
    glow ??= el.animate(
        [
            { boxShadow: `0 0 8px 2px rgba(${RED}, 0.55)` },
            { boxShadow: `0 0 16px 6px rgba(${RED}, 0.9)` },
            { boxShadow: `0 0 8px 2px rgba(${RED}, 0.55)` },
        ],
        { duration: 2400, iterations: Infinity, easing: 'ease-in-out' },
    );
}

function unwear(el: HTMLElement) {
    glow?.cancel();
    glow = undefined;
    el.querySelector('.sinners-pentagram')?.remove();
    for (const p of ['color', 'border-radius', 'z-index', 'transform']) el.style.removeProperty(p);
}

function avatar(on: boolean) {
    const now = performance.now();
    if (!face?.isConnected) {
        if (now - faceLooked < 1500) return;
        faceLooked = now;
        // the one in the header (a user picker further down the page has avatars too)
        face = (deepQueryAll(document, 'uui-avatar') as HTMLElement[]).find((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.top < 70;
        });
        if (!face) return;
        faceSeen = now;
        turned = turning = false;
        glow = undefined;
    }
    const el = face;
    if (!on) {
        if (turned) unwear(el);
        turned = false;
        faceSeen = now; // (and should sin return, it takes its time again)
        try {
            sessionStorage.removeItem(AVATAR_KEY);
        } catch { /* fine */ }
        return;
    }
    if (turning) return;
    if (turned) {
        // a shudder now and then, so it isn't forgotten
        if (now - lastShudder > 14000) {
            lastShudder = now;
            el.animate(
                [0, -9, 8, -6, 4, 0].map((deg) => ({ transform: `scale(1.35) rotate(${deg}deg)` })),
                { duration: 520, easing: 'ease-in-out' },
            );
        }
        return;
    }
    let before = false;
    try {
        before = sessionStorage.getItem(AVATAR_KEY) === '1';
    } catch { /* then it's a first time every time */ }
    if (before) {
        wear(el);
        turned = true;
        lastShudder = now;
        return;
    }
    if (now - faceSeen < AVATAR_BEAT) return;

    // the turn: shake while it swells, become the pentagram at the peak, sink back, glowing
    turning = true;
    el.style.borderRadius = '50%';
    el.style.zIndex = '10';
    const shake = [0, -14, 12, -16, 14, -12, 10, -6, 0];
    const frames: Keyframe[] = shake.map((deg, i) => {
        const k = i / (shake.length - 1);
        return {
            offset: k * 0.55,
            transform: `scale(${1 + k * 1.7}) rotate(${deg}deg)`,
            boxShadow: `0 0 ${k * 26}px ${k * 10}px rgba(${RED}, ${k * 0.95})`,
        };
    });
    frames.push(
        { offset: 0.78, transform: 'scale(2.7) rotate(0deg)', boxShadow: `0 0 30px 12px rgba(${RED}, 1)` },
        { offset: 1, transform: 'scale(1.35) rotate(0deg)', boxShadow: `0 0 12px 4px rgba(${RED}, 0.7)` },
    );
    const turn = el.animate(frames, { duration: 2600, easing: 'ease-in-out' });
    setTimeout(() => {
        if (!el.querySelector('.sinners-pentagram')) el.insertAdjacentHTML('beforeend', PENTAGRAM);
        el.style.color = 'transparent';
    }, 2600 * 0.55);
    turn.onfinish = () => {
        wear(el);
        turning = false;
        turned = true;
        lastShudder = performance.now();
        try {
            sessionStorage.setItem(AVATAR_KEY, '1');
        } catch { /* fine */ }
    };
}

// ------------------------------------------------------------------------------------ ghost

// In the code editor, a comment nobody wrote types itself after the lines that walk the tree. It is
// only drawn (a span put at the end of the editor's line, again whenever the editor redraws it):
// the file, the editor's model and what Save would save are untouched.
const GHOST_BEAT = 3200; // the code as it is, first
const GHOST_PACE = 55; // ms per letter
const GHOSTS: Array<{ after: string; says: string }> = [
    { after: 'CountDescendants', says: '// every node. on every request. it never stops counting.' },
    { after: 'DescendantsOrSelf', says: '// …and again.' },
];
let ghostBorn = 0;
let ghostFor: Element | undefined;

function ghost(on: boolean) {
    const lines = ghostFor?.isConnected ? ghostFor : deepQueryAll(document, '.view-lines')[0];
    if (!lines) return;
    if (ghostFor !== lines) {
        ghostFor = lines;
        ghostBorn = performance.now();
    }
    let t = performance.now() - ghostBorn - GHOST_BEAT;
    for (const g of GHOSTS) {
        // (code editors write their spaces as non-breaking ones; these needles have none)
        const line = [...lines.querySelectorAll('.view-line')].find((l) => (l.textContent ?? '').includes(g.after));
        const shown = on && t > 0 ? Math.min(g.says.length, Math.floor(t / GHOST_PACE)) : 0;
        t -= g.says.length * GHOST_PACE + 1400; // the next one waits for this one, and a breath
        if (!line) continue;
        let span = line.querySelector<HTMLElement>('.sinners-ghost');
        if (!shown) {
            span?.remove();
            continue;
        }
        if (!span) {
            span = document.createElement('span');
            span.className = 'sinners-ghost';
            span.style.cssText = `color:#b3121f;font-style:italic;white-space:pre;pointer-events:none;text-shadow:0 0 7px rgba(${RED},0.55)`;
            (line.firstElementChild ?? line).appendChild(span);
        }
        const text = '  ' + g.says.slice(0, shown) + (shown < g.says.length ? '▌' : '');
        if (span.textContent !== text) span.textContent = text;
    }
}
