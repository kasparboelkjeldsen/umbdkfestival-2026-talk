import { scriptEnded } from './bridge.js';
import { spotlight, type Highlight } from './spotlight.js';
import { clickShow } from './pointer.js';
import { refuse } from './haunt.js';

type StepFn = () => void | Promise<void>;

export interface PresenterStep {
    label: string;
    run: StepFn;
    /**
     * What a person would click to do this by hand (the buttons in the pane). The clicker shows mock
     * mouse pointers clicking them before it runs the step (pointer.ts); the step itself doesn't
     * depend on them.
     */
    clicks?: () => Element[];
}

export const TAB_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;

const STORAGE_KEY = 'sinners-presenter-state';
/** Set by the '0' reset: the Board asks the server to forget its pretences (✨) before it counts. */
export const FORGET_PRETENCES_KEY = 'sinners-forget-pretences';
/**
 * The save-me. Set (to a commandment's number, 1…10) by the talk's deck when it is opened with
 * ?ff=N: the Board then runs, by itself and without exhibits, every fix of every commandment before
 * N that still has sins, and stops on N with the clicker ready. So a demo that died at VIII can be
 * picked up at VIII, on a freshly reset site too.
 */
export const FAST_FORWARD_KEY = 'sinners-fast-forward';

interface PersistedState {
    activeTab: string;
    indices: Record<string, number>;
    /** How many of the tab's exhibits have been shown */
    exhibits?: Record<string, number>;
}

function loadState(): PersistedState {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as PersistedState;
    } catch { /* fresh state */ }
    return { activeTab: '', indices: {} };
}

const _persisted = loadState();
// tab → part → registrations. A commandment that merges several audits (III, VI) has one part per
// audit element; its script is the parts' steps in TAB_PARTS order. The backoffice may construct a
// dashboard twice and throw one copy away, so every registration remembers its element and the one
// still on the page wins.
const _steps = new Map<string, Map<string, Array<{ host: Element; steps: PresenterStep[] }>>>();
const _indices = new Map<string, number>(Object.entries(_persisted.indices ?? {}));
const _exhibits = new Map<string, number>(Object.entries(_persisted.exhibits ?? {}));
let _activeTab = _persisted.activeTab;
let _nextTab: Array<{ host: Element; fn: () => void }> = [];
// A clicker press while a step is still running would run that step twice
let _busy = false;
// A Board that is still arriving (its staged fall from spotless to maximum sin) holds presses back.
// By element, like the registrations: a copy the backoffice threw away must not release the one on the page.
const _holders = new Set<Element>();
const held = () => [..._holders].some((h) => h.isConnected);
// On an exhibit page: has this page's highlight been lit? (An exhibit is a full page load, so this
// starts false on every one.)
let _lit = false;

function persist() {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            activeTab: _activeTab,
            indices: Object.fromEntries(_indices),
            exhibits: Object.fromEntries(_exhibits),
        } satisfies PersistedState));
    } catch { /* storage unavailable — presenter still works, just forgets on reload */ }
}

const PENANCE_URL = '/umbraco/section/settings/dashboard/penance';

/**
 * Where each commandment's sin lives in Umbraco, and where its fix can be seen. A plain URL at
 * position k is shown right before fix step k; `{ url, at: n }` is shown once n fix steps are done,
 * so an exhibit can also be the evidence after a fix. A tab with several sins walks "show it, fix
 * it" per sin: III shows the loose data type, organizes, shows the data types in their folders,
 * shows the flat dictionary, groups it, shows it grouped, shows the media root, pretends.
 *
 * `highlight` is what the page is there to show (spotlight.ts): on the exhibit, the first press puts
 * a ring round it, the next press goes back to the Board. An exhibit without one leaves on the first.
 */
/** A tree item (and what's under it), by its name in the tree */
const treeItem = (label: string | string[], more: Partial<Exclude<Highlight, string>> = {}): Highlight =>
    ({ selector: 'uui-menu-item', label, ...more });
type Exhibit = string | { url: string; at?: number; highlight?: Highlight };
const DOCUMENT_TYPES = '/umbraco/section/settings/workspace/document-type-root';
/** A page in Content with its document type open over it (the modal from its Info tab), on the type's Content tab */
const PAGE_TYPE_IN_ITS_PAGE = '/umbraco/section/content/workspace/document/edit/704a66de-b213-44fe-815a-f988c0707bbf/invariant/view/info/modal/umb-modal-workspace/invariant/general/document-type/edit/b871f83c-2395-4894-be0f-5422c1a71e48/tab/content';
const TAB_EXHIBITS: Partial<Record<string, Exhibit[]>> = {
    'I':    [
        // a page's document type: its one property, 'Inherited from' a composition nothing else uses
        { url: PAGE_TYPE_IN_ITS_PAGE, highlight: 'umb-content-type-design-editor-property' },
        // after Fold In (its one step): the very same page, the property now the document type's own,
        // no 'Inherited from'. (Fold In keeps the property's group, so the same /tab/content opens.)
        { url: PAGE_TYPE_IN_ITS_PAGE, at: 1, highlight: 'umb-content-type-design-editor-property' },
    ],
    'II':   [
        // the document type root as Clean left it: its own folders, its own names (Compositions, Data,
        // Elements, Pages). The same page as the evidence after the fix, so II reads before and after.
        // (It used to open the Home document type's editor, which shows nothing about how types are sorted.)
        { url: DOCUMENT_TYPES, highlight: treeItem('Document Types', { expand: true }) },
        // after Auto categorize (its 3rd step): the folders it made, with the types in them
        { url: DOCUMENT_TYPES, at: 3, highlight: treeItem('Document Types', { expand: true }) },
    ],
    'III':  [
        // one loose data type, and next to it the whole root it's loose in
        { url: '/umbraco/section/settings/workspace/data-type/edit/b5922818-d8d8-43df-88ed-4582a24c0fa6', at: 0, highlight: treeItem('Data Types') },
        // after Organize: the data types in their folders, before the dictionary
        { url: '/umbraco/section/settings/workspace/data-type-root', at: 1, highlight: treeItem('Data Types', { expand: true }) },
        // every key at the root, no parents
        { url: '/umbraco/section/translation', at: 1, highlight: 'umb-tree' },
        // after grouping the keys: the dictionary again, one group opened to show the keys under it
        { url: '/umbraco/section/translation', at: 2, highlight: treeItem('ContactForm', { expand: true }) },
        // the files reset.ps1 drops at the media root (their cards: they come first in the grid)
        {
            url: '/umbraco/section/media/collection',
            at: 2,
            highlight: { selector: 'uui-card-media[name="logo"], uui-card-media[name="Brochure 2019.pdf"], uui-card-media[name="final-final-v2.jpg"]', all: true },
        },
    ],
    // The partial reset.ps1 plants: server path "/megaMenu.cshtml", the leading '/' URL-encoded (%2F)
    // and '.' as %dot% (itself encoded, %25dot%25). Without the '/' the backoffice says "not found"
    'VII':  [
        // the two lines that walk the tree and ask the content service, on every request
        { url: '/umbraco/section/settings/workspace/partial-view/edit/%2FmegaMenu%25dot%25cshtml', highlight: { selector: '.view-line', text: ['Descendants<', 'CountDescendants'], all: true } },
    ],
    // The "Form submissions" collection the seeder plants (DemoSinSeeder.FormSubmissionsKey)
    // (all of it ringed: six hundred of these under one node)
    'VIII': [{ url: '/umbraco/section/content/workspace/document/edit/0d1e5e08-8a2e-4f0e-9d7b-5f0a5b5e0008', highlight: 'umb-document-collection' }],
    'IX':   [
        // Home, rendering, at the root
        { url: '/umbraco/section/content', highlight: treeItem('Home') },
        // after Seek Root Sanctuary: the content tree with its new, template-less root, Home under it
        { url: '/umbraco/section/content', at: 1, highlight: treeItem('Site', { expand: true }) },
    ],
};

/** Script order of the parts of a merged commandment (others have one part, 'main'). */
const TAB_PARTS: Partial<Record<string, string[]>> = {
    'III': ['data-types', 'dictionary', 'media'],
    'VI':  ['aliases', 'keys'],
};

// Where '.' / next goes from a page that isn't the Board (anything not listed: the Board). Content
// used to go via Settings, which cost IX's evidence an extra press; every return is a full page
// load of the Board's URL, so it goes straight there now.
const ELSEWHERE_RULES: Array<{ match: string; target: string }> = [];

function liveSteps(registrations: Array<{ host: Element; steps: PresenterStep[] }>): PresenterStep[] {
    const live = registrations.filter((r) => r.host.isConnected);
    return (live.length ? live : registrations).at(-1)?.steps ?? [];
}

function stepsFor(tabId: string): PresenterStep[] {
    const parts = _steps.get(tabId);
    if (!parts) return [];
    const order = TAB_PARTS[tabId] ?? [...parts.keys()];
    return order.flatMap((part) => liveSteps(parts.get(part) ?? []));
}

function exhibitsFor(tabId: string): Array<{ url: string; at: number; highlight?: Highlight }> {
    return (TAB_EXHIBITS[tabId] ?? []).map((e, k) => (typeof e === 'string' ? { url: e, at: k } : { ...e, at: e.at ?? k }));
}

/** The exhibit this page is (the active tab's last shown one, if we're still on its page). */
function exhibitHere(): { url: string; highlight?: Highlight } | undefined {
    const shown = _exhibits.get(_activeTab) ?? 0;
    const exhibit = exhibitsFor(_activeTab)[shown - 1];
    return exhibit && window.location.pathname.startsWith(exhibit.url) ? exhibit : undefined;
}

function onBoard(): boolean {
    return window.location.pathname.includes('/dashboard/penance');
}

export const presenter = {
    get activeTab(): string {
        return _activeTab;
    },

    setActiveTab(tabId: string) {
        _activeTab = tabId;
        persist();
    },

    /** A Board that isn't ready for the clicker yet: while one holds, forward() and next() do nothing. */
    hold(host: Element, on: boolean) {
        if (on) _holders.add(host);
        else _holders.delete(host);
    },

    /** Exhibit the active tab's next sin (on the Board), or return to the Board (anywhere else). */
    dot() {
        const path = window.location.pathname;

        if (onBoard()) {
            const exhibits = exhibitsFor(_activeTab);
            const shown = _exhibits.get(_activeTab) ?? 0;
            // Past the last exhibit, '.' shows the last one again
            const url = exhibits.length ? exhibits[Math.min(shown, exhibits.length - 1)].url : PENANCE_URL;
            if (exhibits.length && shown < exhibits.length) {
                _exhibits.set(_activeTab, shown + 1);
                persist();
            }
            console.log(`[PRESENTER] dot() on penance tab="${_activeTab}" → ${url}`);
            window.location.href = url;
            return;
        }

        const rule = ELSEWHERE_RULES.find((r) => path === r.match);
        const target = rule ? rule.target : PENANCE_URL;
        console.log(`[PRESENTER] dot() elsewhere path="${path}" → ${target}`);
        window.location.href = target;
    },

    onNextTab(host: Element, fn: () => void) {
        _nextTab = [..._nextTab.filter((r) => r.host !== host && r.host.isConnected), { host, fn }];
    },

    nextTab() {
        console.log('[PRESENTER] nextTab()');
        const live = _nextTab.filter((r) => r.host.isConnected);
        (live.length ? live : _nextTab).at(-1)?.fn();
    },

    /**
     * Register a tab's fix steps. `part` names one audit of a merged commandment (see TAB_PARTS);
     * single-audit commandments leave it out.
     */
    registerSteps(tabId: string, host: Element, steps: PresenterStep[], part = 'main') {
        const parts = _steps.get(tabId) ?? new Map<string, Array<{ host: Element; steps: PresenterStep[] }>>();
        const kept = (parts.get(part) ?? []).filter((r) => r.host !== host && r.host.isConnected);
        parts.set(part, [...kept, { host, steps }]);
        _steps.set(tabId, parts);
    },

    /** The commandment a save-me asked for (see FAST_FORWARD_KEY), if any. */
    get fastForwardTo(): string | undefined {
        try {
            const n = Number(sessionStorage.getItem(FAST_FORWARD_KEY));
            return Number.isInteger(n) && n >= 1 && n <= TAB_ORDER.length ? TAB_ORDER[n - 1] : undefined;
        } catch {
            return undefined;
        }
    },

    /**
     * Absolve everything before `target`: each earlier commandment's exhibits count as shown, and its
     * fix steps run one after the other if it still has sins (`sinsLeft`, the Board's own count).
     * Presses are ignored meanwhile. If a step reloads the page, the Board finds the key still set
     * and carries on from the step it had reached.
     */
    async fastForward(target: string, sinsLeft: (tabId: string) => number, onTab?: (tabId: string) => void) {
        if (_busy) return;
        _busy = true;
        try {
            for (const tab of TAB_ORDER) {
                if (tab === target) break;
                _exhibits.set(tab, exhibitsFor(tab).length);
                const steps = stepsFor(tab);
                if (sinsLeft(tab) > 0) {
                    onTab?.(tab);
                    for (let i = Math.min(_indices.get(tab) ?? 0, steps.length); i < steps.length; i++) {
                        console.log(`[PRESENTER] fast-forward — ${tab} "${steps[i].label}"`);
                        await steps[i].run();
                        _indices.set(tab, i + 1);
                        persist();
                    }
                }
                _indices.set(tab, steps.length);
                persist();
            }
            _activeTab = target;
            persist();
        } finally {
            _busy = false;
            try {
                sessionStorage.removeItem(FAST_FORWARD_KEY);
            } catch { /* then a reload fast-forwards again: harmless, nothing is left to fix */ }
        }
    },

    async next() {
        if (_busy || held()) return;
        const steps = stepsFor(_activeTab);
        const idx = _indices.get(_activeTab) ?? 0;
        console.log(`[PRESENTER] next() — tab="${_activeTab}" step=${idx + 1}/${steps.length}`);
        if (idx >= steps.length) {
            console.log(`[PRESENTER] no more steps on tab "${_activeTab}"`);
            return;
        }
        _busy = true;
        try {
            // first the mock mice click what a person would click, then the fix itself
            let shown = { restore: () => {} };
            try {
                shown = await clickShow(steps[idx].clicks?.() ?? []);
            } catch (e) {
                console.warn('[PRESENTER] no pointers for this step', e);
            }
            await steps[idx].run();
            shown.restore();
        } finally {
            _busy = false;
        }
        _indices.set(_activeTab, idx + 1);
        persist();
        console.log(`[PRESENTER] step ${idx + 1} "${steps[idx].label}" done`);
    },

    /**
     * The clicker's "next": one press, one beat of the demo. Per commandment it walks
     * exhibit a sin → return to the Board → its fix step (repeated per exhibit) → the remaining
     * fix steps → next commandment. After the last step of the last commandment it tells the talk's
     * deck the script is over (bridge `end`), so the deck can take the clicker back.
     * Off the Board it always means "return to the Board".
     */
    async forward() {
        if (_busy || held()) return;
        if (!onBoard()) {
            // An exhibit with something to point at: the first press lights it, the next one leaves
            const highlight = exhibitHere()?.highlight;
            if (highlight && !_lit) {
                // …unless the page won't have it: the Welcome dashboard says NO three times first (haunt.ts)
                if (refuse()) return;
                _lit = true;
                spotlight(highlight);
                return;
            }
            this.dot();
            return;
        }
        // The dashboard hasn't told us which tab it shows yet — don't guess
        if (!_activeTab || !_nextTab.some((r) => r.host.isConnected)) return;

        const steps = stepsFor(_activeTab);
        const idx = Math.min(_indices.get(_activeTab) ?? 0, steps.length);
        const shown = _exhibits.get(_activeTab) ?? 0;

        // The next exhibit comes once its `at` fix steps are done (a plain one: right before step k)
        const exhibits = exhibitsFor(_activeTab);
        if (shown < exhibits.length && exhibits[shown].at <= idx) {
            this.dot();
            return;
        }

        if (idx < steps.length) {
            await this.next();
            return;
        }

        if (_activeTab === TAB_ORDER[TAB_ORDER.length - 1]) {
            console.log('[PRESENTER] forward() — all ten commandments atoned, handing the clicker back');
            scriptEnded();
            return;
        }
        this.nextTab();
    },

    /**
     * Wipe all demo state and reload — the "0" panic reset. Clears presenter progress and
     * exhibited sins here, and has the Board tell the server to forget its pretences (✨).
     */
    reset() {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem('sinners-welcome-seen'); // the Welcome dashboard's reveal plays again (haunt.ts)
            sessionStorage.removeItem('sinners-avatar-turned'); // …and the avatar's
            sessionStorage.setItem(FORGET_PRETENCES_KEY, '1');
            localStorage.removeItem('sinners-media-pretend'); // the pretence used to live here
        } catch { /* ignore */ }
        window.location.href = PENANCE_URL;
    },
};
