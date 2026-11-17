import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

type SacredType = 'Page' | 'Block' | 'Data' | 'Composition';

interface ContentTypeClassification {
    contentTypeAlias: string;
    contentTypeName: string;
    isElement: boolean;
    classification: SacredType | null;
    folderPath: string;
    suggestedClassification: SacredType | null;
}

const SACRED_TYPES: SacredType[] = ['Page', 'Block', 'Data', 'Composition'];
const API_BASE = '/umbraco/management/api/v1/sinners';

@customElement('sinners-four-sacred-types')
export class FourSacredTypesElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _items: ContentTypeClassification[] = [];
    @state() private _loading = true;
    @state() private _saving = false;
    @state() private _categorizing = false;
    @state() private _pendingChanges = new Map<string, SacredType>();

    static override styles = css`
        .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: var(--uui-size-space-5, 24px);
        }

        .stat-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: var(--uui-color-surface-alt, #f4f4f4);
            color: var(--uui-color-text, #333);
        }

        .stat-chip.sinful {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .stat-chip.clean {
            background: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--sinners-on-bright, white);
        }

        details {
            border: 1px solid var(--uui-color-border, #d8d7d9);
            border-radius: var(--uui-border-radius, 3px);
            margin-bottom: 8px;
            overflow: hidden;
        }

        summary {
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            font-size: 14px;
            user-select: none;
            background: var(--uui-color-surface, #fff);
            list-style: none;
        }

        summary::-webkit-details-marker { display: none; }

        summary::before {
            content: '▶';
            font-size: 12px;
            transition: transform 0.15s ease;
            color: var(--uui-color-text-alt, #888);
        }

        details[open] summary::before {
            transform: rotate(90deg);
        }

        details[open] summary {
            border-bottom: 1px solid var(--uui-color-border, #d8d7d9);
        }

        .group-count {
            font-weight: 400;
            color: var(--uui-color-text-alt, #888);
            font-size: 12px;
        }

        .sinful-label { color: var(--uui-color-danger-standalone, #d42054); }

        .item-row {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 84px 168px;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            background: var(--uui-color-surface, #fff);
        }

        .item-row:last-child { border-bottom: none; }

        .item-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .name-col {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .name {
            font-weight: 500;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .path {
            font-size: 12px;
            color: var(--uui-color-text-alt, #8d8d8d);
            font-family: monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        code {
            font-family: monospace;
            background: var(--uui-color-surface-alt, #f4f4f4);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 600;
            background: var(--uui-color-surface-alt, #f4f4f4);
        }

        .badge.element {
            background: var(--uui-color-selected, #3544b1);
            color: var(--sinners-on-bright, white);
        }

        select {
            width: 100%;
            padding: 5px 8px;
            border: 1px solid var(--uui-color-border, #d8d7d9);
            border-radius: var(--uui-border-radius, 3px);
            background: white;
            font-size: 13px;
        }

        select.unclassified {
            border-color: var(--uui-color-warning-standalone, #f0ac00);
        }

        .suggestion {
            font-size: 12px;
            color: var(--uui-color-interactive, #3544b1);
            cursor: pointer;
            text-decoration: underline dotted;
            display: block;
            margin-top: 2px;
        }

        .empty {
            padding: 32px;
            text-align: center;
            color: var(--uui-color-text-alt, #888);
        }

        .save-bar {
            display: flex;
            justify-content: flex-end;
            padding: 12px 16px;
            border-top: 1px solid var(--uui-color-border, #d8d7d9);
            background: var(--uui-color-surface, #fff);
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('II', this, [
            // (a pointer per dropdown it fills in, as many as there's room for)
            { label: 'Autofill classifications', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('select')], run: () => this.#autofillClassifications() },
            { label: 'Save all', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.save-bar uui-button')], run: () => this.#saveAll() },
            { label: 'Auto categorize', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.stats uui-button')], run: () => this.#autoCategorize() },
        ]);
        this.consumeContext(UMB_AUTH_CONTEXT, (ctx) => {
            this.#authCtx = ctx;
            void this.#load();
        });
    }

    async #fetchAuth(url: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.#authCtx?.getLatestToken();
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers ?? {}),
            },
        });
    }

    async #load() {
        this._loading = true;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/content-type-classifications`);
            if (res.ok) this._items = (await res.json()) as ContentTypeClassification[];
            this.#reportStatus();
        } finally {
            this._loading = false;
        }
    }

    #reportStatus() {
        const unclassified = this._items.filter((i) => !i.classification).length;
        this.dispatchEvent(new CustomEvent('sinners-status', {
            bubbles: true, composed: true,
            detail: { issueCount: unclassified, severity: unclassified > 0 ? 'error' : 'ok' },
        }));
    }

    #onSelect(alias: string, value: string) {
        const map = new Map(this._pendingChanges);
        if (value) map.set(alias, value as SacredType);
        else map.delete(alias);
        this._pendingChanges = map;
    }

    #applySuggestion(alias: string, suggestion: SacredType) {
        const map = new Map(this._pendingChanges);
        map.set(alias, suggestion);
        this._pendingChanges = map;
    }

    #autofillClassifications() {
        const map = new Map(this._pendingChanges);
        for (const item of this._items) {
            if (item.classification) continue;
            if (map.has(item.contentTypeAlias)) continue;

            if (item.suggestedClassification) {
                map.set(item.contentTypeAlias, item.suggestedClassification);
                console.log(`[RULE II] suggestion → ${item.contentTypeAlias} = ${item.suggestedClassification}`);
            } else {
                const path = item.folderPath ?? '';
                if (path.startsWith('/Elements/Setting')) {
                    map.set(item.contentTypeAlias, 'Data');
                    console.log(`[RULE II] path rule (Data) → ${item.contentTypeAlias} (${path})`);
                } else if (path.startsWith('/Elements/')) {
                    map.set(item.contentTypeAlias, 'Block');
                    console.log(`[RULE II] path rule (Block) → ${item.contentTypeAlias} (${path})`);
                } else {
                    console.warn(`[RULE II] no rule matched — ${item.contentTypeAlias} (${path}) left unclassified`);
                }
            }
        }
        this._pendingChanges = map;
        console.log(`[RULE II] autofill complete — ${map.size} pending`);
    }

    async #autoCategorize() {
        this._categorizing = true;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/auto-categorize`, { method: 'POST' });
            if (res.ok) {
                await this.#load();
                absolved(2, 'auto-categorize');
            }
        } finally {
            this._categorizing = false;
        }
    }

    async #saveAll() {
        if (this._pendingChanges.size === 0) return;

        this._saving = true;
        try {
            let saved = 0;
            for (const [alias, classification] of this._pendingChanges) {
                const res = await this.#fetchAuth(`${API_BASE}/content-type-classifications`, {
                    method: 'POST',
                    body: JSON.stringify({ contentTypeAlias: alias, classification }),
                });
                if (res.ok) {
                    saved++;
                    this._items = this._items.map((i) =>
                        i.contentTypeAlias === alias
                            ? { ...i, classification, suggestedClassification: null }
                            : i,
                    );
                    const map = new Map(this._pendingChanges);
                    map.delete(alias);
                    this._pendingChanges = map;
                }
            }
            // Saving a classification is what lowers the count (autofill only fills the dropdowns)
            if (saved > 0) {
                this.#reportStatus();
                absolved(2, 'classify');
            }
        } finally {
            this._saving = false;
        }
    }

    #current(item: ContentTypeClassification): SacredType | '' {
        return this._pendingChanges.get(item.contentTypeAlias) ?? item.classification ?? '';
    }

    #renderItem(item: ContentTypeClassification) {
        const current = this.#current(item);
        const hasPending = this._pendingChanges.has(item.contentTypeAlias);

        return html`
            <div class="item-row">
                <div class="name-col">
                    <span class="name" title=${item.contentTypeName}>${item.contentTypeName}</span>
                    <span class="path" title=${item.folderPath}>${item.folderPath}</span>
                </div>
                <code>${item.contentTypeAlias}</code>
                <span class="badge ${item.isElement ? 'element' : ''}">
                    ${item.isElement ? 'Element' : 'Document'}
                </span>
                <div>
                    <select
                        class=${current ? '' : 'unclassified'}
                        .value=${current}
                        @change=${(e: Event) =>
                            this.#onSelect(item.contentTypeAlias, (e.target as HTMLSelectElement).value)}
                    >
                        <option value="">— Unclassified —</option>
                        ${SACRED_TYPES.map(
                            (type) => html`<option value=${type} ?selected=${current === type}>${type}</option>`,
                        )}
                    </select>
                    ${item.suggestedClassification && !hasPending
                        ? html`<span
                              class="suggestion"
                              @click=${() => this.#applySuggestion(item.contentTypeAlias, item.suggestedClassification!)}
                              >Suggest: ${item.suggestedClassification}</span
                          >`
                        : nothing}
                </div>
            </div>
        `;
    }

    #renderGroup(label: string, items: ContentTypeClassification[], open = false) {
        if (items.length === 0) return nothing;
        return html`
            <details ?open=${open}>
                <summary>
                    <span class=${label === 'Unclassified' ? 'sinful-label' : ''}>${label}</span>
                    <span class="group-count">${items.length}</span>
                </summary>
                ${items.map((item) => this.#renderItem(item))}
            </details>
        `;
    }

    override render() {
        const unclassified = this._items.filter((i) => !i.classification);
        const byType = (type: SacredType) => this._items.filter((i) => i.classification === type);
        const totalUnclassified = unclassified.length;

        return html`
            <uui-box headline="II — Four content types: Page, Block, Data, Composition">
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : this._items.length === 0
                      ? html`<div class="empty">No content types found.</div>`
                      : html`
                            <div class="stats">
                                <uui-button
                                    look="outline"
                                    .disabled=${this._categorizing}
                                    @click=${() => void this.#autoCategorize()}
                                >
                                    ${this._categorizing ? 'Categorizing…' : 'Auto Categorize'}
                                </uui-button>
                                ${totalUnclassified > 0
                                    ? html`<span class="stat-chip sinful">⚠ ${totalUnclassified} unclassified</span>`
                                    : html`<span class="stat-chip clean">✓ All classified</span>`}
                                ${SACRED_TYPES.map((type) => {
                                    const count = byType(type).length;
                                    return count > 0
                                        ? html`<span class="stat-chip">${type}: ${count}</span>`
                                        : nothing;
                                })}
                            </div>

                            ${this.#renderGroup('Unclassified', unclassified, true)}
                            ${SACRED_TYPES.map((type) => this.#renderGroup(type, byType(type)))}
                            <div class="save-bar">
                                <uui-button
                                    look="primary"
                                    .disabled=${this._pendingChanges.size === 0 || this._saving}
                                    @click=${() => void this.#saveAll()}
                                >
                                    ${this._saving ? 'Saving…' : 'Save'}
                                </uui-button>
                            </div>
                        `}
            </uui-box>
        `;
    }
}
