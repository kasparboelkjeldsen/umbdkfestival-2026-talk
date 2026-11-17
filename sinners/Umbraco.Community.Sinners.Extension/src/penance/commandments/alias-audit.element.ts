import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface AliasIssue {
    contentTypeAlias: string;
    contentTypeName: string;
    folderPath: string;
    isCamelCase: boolean;
    unrecognizedWords: string[];
    isBlessed: boolean;
}

const API_BASE = '/umbraco/management/api/v1/sinners';

@customElement('sinners-alias-audit')
export class AliasAuditElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _items: AliasIssue[] = [];
    @state() private _loading = true;
    @state() private _blessing = new Set<string>();

    static override styles = css`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .issue-row {
            padding: 12px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .issue-row:last-child { border-bottom: none; }
        .issue-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .issue-row.blessed { opacity: 0.55; }

        .name-block {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 0;
        }

        .name {
            font-weight: 600;
            font-size: 13px;
        }

        .alias {
            font-family: monospace;
            font-size: 12px;
            color: var(--uui-color-text-alt, #555);
        }

        .path {
            font-size: 12px;
            color: var(--uui-color-text-alt, #8d8d8d);
            font-family: monospace;
        }

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 3px;
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
        }

        .tag.error {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .tag.warning {
            background: #f0ac00;
            color: #1d0d00;
        }

        .tag code {
            font-family: monospace;
            font-weight: 400;
            opacity: 0.85;
        }

        .bless-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid var(--uui-color-border-standalone, #d0d0d0);
            background: var(--uui-color-surface, #fff);
            color: var(--uui-color-text-alt, #555);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .bless-btn:hover { background: var(--uui-color-surface-alt, #f5f5f5); }

        .bless-btn.blessed {
            border-color: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--uui-color-positive-standalone, #0d7a54);
        }

        .bless-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('VI', this, [
            {
                label: 'Bless first alias',
                clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.bless-btn:not(.blessed)')].slice(0, 1),
                run: () => {
                    const first = this._items.find((i) => !i.isBlessed);
                    if (first) return this.#bless(first, true);
                },
            },
        ], 'aliases');
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
            const res = await this.#fetchAuth(`${API_BASE}/alias-issues`);
            if (res.ok) this._items = (await res.json()) as AliasIssue[];

            const unblessedErrors = this._items.filter((i) => !i.isBlessed && !i.isCamelCase).length;
            const unblessedWarnings = this._items.filter((i) => !i.isBlessed && i.isCamelCase && i.unrecognizedWords.length > 0).length;
            const issueCount = unblessedErrors + unblessedWarnings;
            const severity = unblessedErrors > 0 ? 'error' : unblessedWarnings > 0 ? 'warning' : 'ok';

            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount, severity },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #bless(item: AliasIssue, blessed: boolean) {
        this._blessing = new Set([...this._blessing, item.contentTypeAlias]);
        try {
            await this.#fetchAuth(`${API_BASE}/bless-alias`, {
                method: 'POST',
                body: JSON.stringify({ contentTypeAlias: item.contentTypeAlias, blessed }),
            });
            await this.#load();
            if (blessed) absolved(6, 'bless');
        } finally {
            this._blessing = new Set([...this._blessing].filter((a) => a !== item.contentTypeAlias));
        }
    }

    #renderItem(item: AliasIssue) {
        const isBlessing = this._blessing.has(item.contentTypeAlias);
        return html`
            <div class="issue-row ${item.isBlessed ? 'blessed' : ''}">
                <div class="name-block">
                    <span class="name">${item.contentTypeName}</span>
                    <span class="alias">${item.contentTypeAlias}</span>
                    <span class="path">${item.folderPath}</span>
                    <div class="tags">
                        ${!item.isCamelCase
                            ? html`<span class="tag error">✕ Not camelCase</span>`
                            : nothing}
                        ${item.unrecognizedWords.map((w) => html`
                            <span class="tag warning">? <code>${w}</code></span>
                        `)}
                    </div>
                </div>
                <button
                    class="bless-btn ${item.isBlessed ? 'blessed' : ''}"
                    ?disabled=${isBlessing}
                    @click=${() => this.#bless(item, !item.isBlessed)}
                    title=${item.isBlessed
                        ? 'Remove blessing — surface this alias as an issue again'
                        : 'Mark this alias as intentionally named'}>
                    ${isBlessing ? '⏳' : item.isBlessed ? '✦ Blessed' : '✦ Bless'}
                </button>
            </div>
        `;
    }

    override render() {
        return html`
            <uui-box headline="VI — Thy names: aliases are English camelCase">
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : this._items.length === 0
                      ? html`<div class="clean">✓ All document type aliases are valid camelCase English.</div>`
                      : html`${this._items.map((item) => this.#renderItem(item))}`}
            </uui-box>
        `;
    }
}
