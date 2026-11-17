import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface SinfulProperty {
    propertyAlias: string;
    propertyName: string;
    editorAlias: string;
    isBlessed: boolean;
}

interface EmptyComposition {
    contentTypeAlias: string;
    contentTypeName: string;
    folderPath: string;
}

interface SinfulComposition {
    contentTypeAlias: string;
    contentTypeName: string;
    folderPath: string;
    sinfulProperties: SinfulProperty[];
    usedOn: string[];
}

interface FoldInResult {
    success: boolean;
    message: string;
    affectedDocTypeCount: number;
    affectedContentCount: number;
}

const API_BASE = '/umbraco/management/api/v1/sinners';

const EDITOR_LABELS: Record<string, string> = {
    'Umbraco.BlockList': 'Block List',
    'Umbraco.BlockGrid': 'Block Grid',
    'Umbraco.RichText': 'Rich Text',
};

@customElement('sinners-content-not-composable')
export class ContentNotComposableElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _items: SinfulComposition[] = [];
    @state() private _emptyItems: EmptyComposition[] = [];
    @state() private _loading = true;
    // tracks which "compositionAlias:propertyAlias" keys are currently folding or blessing
    @state() private _folding = new Set<string>();
    @state() private _blessing = new Set<string>();
    @state() private _deleting = new Set<string>();
    @state() private _lastResult: { key: string; result: FoldInResult } | null = null;

    static override styles = css`
        .empty {
            padding: 32px;
            text-align: center;
            color: var(--uui-color-text-alt, #888);
        }

        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .composition-row {
            padding: 14px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            background: var(--uui-color-surface, #fff);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .composition-row:last-child { border-bottom: none; }
        .composition-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .name-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
        }

        .name {
            font-weight: 600;
            font-size: 13px;
        }

        .path {
            font-size: 12px;
            color: var(--uui-color-text-alt, #8d8d8d);
            font-family: monospace;
        }

        .props {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
        }

        .prop-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 600;
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .prop-chip.blessed {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .prop-chip code {
            font-family: monospace;
            font-weight: 400;
            opacity: 0.75;
        }

        .fold-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid rgba(255,255,255,0.5);
            background: rgba(0,0,0,0.15);
            color: var(--sinners-on-bright, white);
            cursor: pointer;
            white-space: nowrap;
            letter-spacing: 0.02em;
        }

        .fold-btn:hover {
            background: rgba(0,0,0,0.28);
        }

        .fold-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .used-on {
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
            margin-top: 4px;
        }

        .used-on strong {
            color: var(--uui-color-text, #333);
        }

        .count-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 24px;
            padding: 0 6px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
            white-space: nowrap;
        }

        .count-badge.blessed {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .section-divider {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px 4px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--uui-color-text-alt, #888);
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            margin-top: 4px;
        }

        .empty-comp-row {
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .empty-comp-row:last-child { border-bottom: none; }
        .empty-comp-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .delete-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 9px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: none;
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .delete-btn:hover { background: #b01a44; }

        .delete-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .result-banner {
            margin: 8px 16px 4px;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
        }

        .result-banner.success {
            background: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--sinners-on-bright, white);
            border: 1px solid var(--uui-color-positive, #1ab873);
        }

        .result-banner.error {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
            border: 1px solid var(--uui-color-danger, #d42054);
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('I', this, [
            {
                label: 'Fold In & bless everything',
                // the Fold In button of the two it folds, the Bless button of the three it blesses
                clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.prop-chip')].flatMap((chip) => {
                    const alias = chip.querySelector('code')?.textContent?.trim() ?? '';
                    const buttons = chip.querySelectorAll('.fold-btn');
                    const which = ['contentRows', 'socialIconLinks'].includes(alias) ? 0
                        : ['instructionMessage', 'successMessage', 'errorMessage'].includes(alias) ? 1 : -1;
                    return which >= 0 && buttons[which] ? [buttons[which]] : [];
                }),
                run: async () => {
                    await this.#foldInByAlias('contentRows');
                    await this.#foldInByAlias('socialIconLinks');
                    await this.#blessByAlias('instructionMessage');
                    await this.#blessByAlias('successMessage');
                    await this.#blessByAlias('errorMessage');
                },
            },
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
            const [sinful, empty] = await Promise.all([
                this.#fetchAuth(`${API_BASE}/sinful-compositions`),
                this.#fetchAuth(`${API_BASE}/empty-compositions`),
            ]);
            if (sinful.ok) this._items = (await sinful.json()) as SinfulComposition[];
            if (empty.ok) this._emptyItems = (await empty.json()) as EmptyComposition[];

            const unblessedProps = this._items.reduce(
                (sum, item) => sum + item.sinfulProperties.filter((p) => !p.isBlessed).length, 0);
            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount: unblessedProps, severity: unblessedProps > 0 ? 'error' : 'ok' },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #foldInByAlias(propertyAlias: string) {
        const allProps = this._items.flatMap(i => i.sinfulProperties.map(p => `${i.contentTypeAlias}.${p.propertyAlias}`));
        console.log(`[RULE I] foldInByAlias("${propertyAlias}") — available:`, allProps);
        for (const item of this._items) {
            const prop = item.sinfulProperties.find((p) => p.propertyAlias === propertyAlias);
            if (prop) {
                console.log(`[RULE I] found "${propertyAlias}" on "${item.contentTypeAlias}", folding in`);
                await this.#foldInDirect(item, prop);
                return;
            }
        }
        console.warn(`[RULE I] property "${propertyAlias}" not found in any sinful composition`);
    }

    async #blessByAlias(propertyAlias: string) {
        const allProps = this._items.flatMap(i => i.sinfulProperties.map(p => `${i.contentTypeAlias}.${p.propertyAlias}(blessed=${p.isBlessed})`));
        console.log(`[RULE I] blessByAlias("${propertyAlias}") — available:`, allProps);
        for (const item of this._items) {
            const prop = item.sinfulProperties.find((p) => p.propertyAlias === propertyAlias && !p.isBlessed);
            if (prop) {
                console.log(`[RULE I] found unblessed "${propertyAlias}" on "${item.contentTypeAlias}", blessing`);
                await this.#bless(item, prop, true);
                return;
            }
        }
        console.warn(`[RULE I] property "${propertyAlias}" not found or already blessed`);
    }

    async #foldInDirect(composition: SinfulComposition, property: SinfulProperty) {
        const key = `${composition.contentTypeAlias}:${property.propertyAlias}`;
        this._folding = new Set([...this._folding, key]);
        this._lastResult = null;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/fold-in`, {
                method: 'POST',
                body: JSON.stringify({
                    compositionAlias: composition.contentTypeAlias,
                    propertyAlias: property.propertyAlias,
                }),
            });
            const result = (await res.json()) as FoldInResult;
            this._lastResult = { key, result };
            if (result.success) {
                await this.#load();
                absolved(1, 'fold-in');
            }
        } catch (e) {
            this._lastResult = {
                key,
                result: { success: false, message: String(e), affectedDocTypeCount: 0, affectedContentCount: 0 },
            };
        } finally {
            this._folding = new Set([...this._folding].filter((k) => k !== key));
        }
    }

    async #foldIn(composition: SinfulComposition, property: SinfulProperty) {
        const key = `${composition.contentTypeAlias}:${property.propertyAlias}`;

        const confirmed = window.confirm(
            `Fold "${property.propertyAlias}" from "${composition.contentTypeName}" into: ${composition.usedOn.join(', ')}?\n\n` +
            `This will:\n` +
            `  1. Add "${property.propertyAlias}_fold_tmp" to each target doc type\n` +
            `  2. Copy all content values across\n` +
            `  3. Remove the property from the composition\n` +
            `  4. Rename the temp property back to "${property.propertyAlias}"\n\n` +
            `Content nodes will be saved as drafts. This cannot be undone.`
        );
        if (!confirmed) return;

        this._folding = new Set([...this._folding, key]);
        this._lastResult = null;

        try {
            const res = await this.#fetchAuth(`${API_BASE}/fold-in`, {
                method: 'POST',
                body: JSON.stringify({
                    compositionAlias: composition.contentTypeAlias,
                    propertyAlias: property.propertyAlias,
                }),
            });
            const result = (await res.json()) as FoldInResult;
            this._lastResult = { key, result };
            if (result.success) {
                await this.#load();
                absolved(1, 'fold-in');
            }
        } catch (e) {
            this._lastResult = {
                key,
                result: { success: false, message: String(e), affectedDocTypeCount: 0, affectedContentCount: 0 },
            };
        } finally {
            this._folding = new Set([...this._folding].filter((k) => k !== key));
        }
    }

    async #deleteComposition(item: EmptyComposition) {
        const confirmed = window.confirm(
            `Delete "${item.contentTypeName}" (${item.contentTypeAlias})?\n\nThis cannot be undone.`
        );
        if (!confirmed) return;

        this._deleting = new Set([...this._deleting, item.contentTypeAlias]);
        try {
            await this.#fetchAuth(`${API_BASE}/empty-compositions/${encodeURIComponent(item.contentTypeAlias)}`, {
                method: 'DELETE',
            });
            await this.#load();
        } finally {
            this._deleting = new Set([...this._deleting].filter((a) => a !== item.contentTypeAlias));
        }
    }

    async #bless(composition: SinfulComposition, property: SinfulProperty, blessed: boolean) {
        const key = `${composition.contentTypeAlias}:${property.propertyAlias}`;
        this._blessing = new Set([...this._blessing, key]);
        try {
            await this.#fetchAuth(`${API_BASE}/bless`, {
                method: 'POST',
                body: JSON.stringify({
                    compositionAlias: composition.contentTypeAlias,
                    propertyAlias: property.propertyAlias,
                    blessed,
                }),
            });
            await this.#load();
            if (blessed) absolved(1, 'bless');
        } finally {
            this._blessing = new Set([...this._blessing].filter((k) => k !== key));
        }
    }

    #renderItem(item: SinfulComposition) {
        return html`
            <div class="composition-row">
                <div class="name-block">
                    <span class="name">${item.contentTypeName}</span>
                    <span class="path">${item.folderPath}</span>
                    <div class="props">
                        ${item.sinfulProperties.map((p) => {
                            const key = `${item.contentTypeAlias}:${p.propertyAlias}`;
                            const isFolding = this._folding.has(key);
                            const isBlessing = this._blessing.has(key);
                            return html`
                                <span class="prop-chip ${p.isBlessed ? 'blessed' : ''}">
                                    ${EDITOR_LABELS[p.editorAlias] ?? p.editorAlias}
                                    <code>${p.propertyAlias}</code>
                                    <button
                                        class="fold-btn"
                                        ?disabled=${isFolding || isBlessing}
                                        @click=${() => this.#foldIn(item, p)}
                                        title="Move this property directly onto the doc types that compose it">
                                        ${isFolding ? '⏳' : '↩ Fold In'}
                                    </button>
                                    <button
                                        class="fold-btn"
                                        ?disabled=${isFolding || isBlessing}
                                        @click=${() => this.#bless(item, p, !p.isBlessed)}
                                        title=${p.isBlessed ? 'Remove blessing from this property' : 'Mark this property as intentionally composable'}>
                                        ${isBlessing ? '⏳' : p.isBlessed ? '✕ Unbless' : '✦ Bless'}
                                    </button>
                                </span>
                            `;
                        })}
                    </div>
                    <div class="used-on">
                        Composed into:
                        <strong>${item.usedOn.join(', ')}</strong>
                    </div>
                </div>
                <span class="count-badge ${item.sinfulProperties.every((p) => p.isBlessed) ? 'blessed' : ''}">${item.sinfulProperties.length}</span>
            </div>
        `;
    }

    #renderEmptySection() {
        if (this._emptyItems.length === 0) return nothing;
        return html`
            <div class="section-divider">Empty compositions</div>
            ${this._emptyItems.map((item) => html`
                <div class="empty-comp-row">
                    <div class="name-block">
                        <span class="name">${item.contentTypeName}</span>
                        <span class="path">${item.folderPath}</span>
                    </div>
                    <button
                        class="delete-btn"
                        ?disabled=${this._deleting.has(item.contentTypeAlias)}
                        @click=${() => this.#deleteComposition(item)}>
                        ${this._deleting.has(item.contentTypeAlias) ? '⏳' : '⊗ Delete'}
                    </button>
                </div>
            `)}
        `;
    }

    override render() {
        const lastResult = this._lastResult;
        return html`
            <uui-box headline="I — Content is not composable">
                ${lastResult
                    ? html`
                          <div class="result-banner ${lastResult.result.success ? 'success' : 'error'}">
                              ${lastResult.result.message}
                          </div>
                      `
                    : nothing}
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : html`
                          ${this._items.length === 0
                              ? html`<div class="clean">✓ No compositions expose block lists, block grids, or rich text editors.</div>`
                              : html`${this._items.map((item) => this.#renderItem(item))}`}
                          ${this.#renderEmptySection()}
                      `}
            </uui-box>
        `;
    }
}
