import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface UnorganizedDataType {
    key: string;
    name: string;
    editorAlias: string;
    isBuiltIn: boolean;
    targetFolder: string;
}

const API_BASE = '/umbraco/management/api/v1/sinners';

@customElement('sinners-data-types-in-folders')
export class DataTypesInFoldersElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _items: UnorganizedDataType[] = [];
    @state() private _loading = true;
    @state() private _organizing = false;
    @state() private _lastMessage: { success: boolean; text: string } | null = null;

    static override styles = css`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .toolbar {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .count {
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .organize-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            border: none;
            background: var(--sinners-action-btn-bg, #1b264f);
            color: var(--sinners-action-btn-color, white);
            cursor: pointer;
        }

        .organize-btn:hover { opacity: 0.88; }

        .organize-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .folder-group {
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .folder-group:last-child { border-bottom: none; }

        .folder-header {
            padding: 8px 16px;
            background: var(--uui-color-surface-alt, #fafafa);
            font-size: 12px;
            font-weight: 700;
            font-family: monospace;
            color: var(--uui-color-text-alt, #888);
            letter-spacing: 0.03em;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .dt-row {
            padding: 8px 16px 8px 28px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f5f5f5);
            font-size: 12px;
        }

        .dt-row:last-child { border-bottom: none; }

        .dt-name {
            flex: 1;
            font-weight: 500;
        }

        .built-in-badge {
            font-size: 12px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #888);
            white-space: nowrap;
        }

        .result-banner {
            margin: 8px 16px 4px;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            color: var(--sinners-on-bright, white);
        }

        .result-banner.success {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .result-banner.error {
            background: var(--uui-color-danger-standalone, #d42054);
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('III', this, [
            { label: 'Organize data types', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.organize-btn')], run: () => this.#organizeAll() },
        ], 'data-types');
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
            const res = await this.#fetchAuth(`${API_BASE}/unorganized-data-types`);
            if (res.ok) this._items = (await res.json()) as UnorganizedDataType[];

            const count = this._items.length;
            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount: count, severity: count > 0 ? 'error' : 'ok' },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #organizeAll() {
        this._organizing = true;
        this._lastMessage = null;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/organize-data-types`, { method: 'POST' });
            if (res.ok) {
                const result = await res.json() as { organizedCount: number };
                this._lastMessage = {
                    success: true,
                    text: `Organized ${result.organizedCount} data type(s) into folders.`,
                };
                await this.#load();
                absolved(3, 'organize-data-types');
            } else {
                this._lastMessage = { success: false, text: `Failed to organize data types (HTTP ${res.status}).` };
            }
        } catch (e) {
            this._lastMessage = { success: false, text: String(e) };
        } finally {
            this._organizing = false;
        }
    }

    #groupByFolder(): Map<string, UnorganizedDataType[]> {
        const map = new Map<string, UnorganizedDataType[]>();
        for (const item of this._items) {
            const group = map.get(item.targetFolder) ?? [];
            group.push(item);
            map.set(item.targetFolder, group);
        }
        return map;
    }

    override render() {
        const msg = this._lastMessage;
        return html`
            <uui-box headline="III — The root is bare: data types live in folders">
                ${msg
                    ? html`<div class="result-banner ${msg.success ? 'success' : 'error'}">${msg.text}</div>`
                    : nothing}
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : this._items.length === 0
                      ? html`<div class="clean">✓ All data types are in folders.</div>`
                      : html`
                            <div class="toolbar">
                                <span class="count">${this._items.length} data type(s) need organizing</span>
                                <button
                                    class="organize-btn"
                                    ?disabled=${this._organizing}
                                    @click=${this.#organizeAll}>
                                    ${this._organizing ? '⏳ Organizing…' : '⊞ Organize All'}
                                </button>
                            </div>
                            ${[...this.#groupByFolder().entries()].map(([folder, items]) => html`
                                <div class="folder-group">
                                    <div class="folder-header">${folder}</div>
                                    ${items.map((dt) => html`
                                        <div class="dt-row">
                                            <span class="dt-name">${dt.name}</span>
                                            ${dt.isBuiltIn
                                                ? html`<span class="built-in-badge">built-in</span>`
                                                : nothing}
                                        </div>
                                    `)}
                                </div>
                            `)}
                        `}
            </uui-box>
        `;
    }
}
