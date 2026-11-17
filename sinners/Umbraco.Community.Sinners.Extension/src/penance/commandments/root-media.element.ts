import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter, FORGET_PRETENCES_KEY } from '../presenter.js';
import { absolved } from '../bridge.js';
import { showMagic } from '../magic.js';

interface RootMediaItem {
    key: string;
    name: string;
    mediaTypeAlias: string;
    createDate: string;
}

interface RootMediaAudit {
    items: RootMediaItem[];
    pretending: boolean;
}

const API_BASE = '/umbraco/management/api/v1/sinners';

@customElement('sinners-root-media')
export class RootMediaElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _items: RootMediaItem[] = [];
    @state() private _loading = true;
    @state() private _pretending = false; // decided in #load, validated against actual media

    static override styles = css`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .info {
            padding: 10px 16px 4px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .item-row {
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .item-row:last-child { border-bottom: none; }
        .item-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .item-name {
            flex: 1;
            font-weight: 500;
            font-size: 13px;
        }

        .item-type {
            font-family: monospace;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 3px;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #555);
            white-space: nowrap;
        }

        .item-date {
            font-size: 12px;
            color: var(--uui-color-text-alt, #aaa);
            white-space: nowrap;
        }

        .pretend-btn {
            margin: 12px 16px;
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('III', this, [
            { label: 'Pretend to fix the media root ✨', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.pretend-btn')], run: () => this.#pretend() },
        ], 'media');
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
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers ?? {}),
            },
        });
    }

    async #load() {
        this._loading = true;
        try {
            // The '0' reset asked us to forget the pretence before counting
            let forget = false;
            try { forget = sessionStorage.getItem(FORGET_PRETENCES_KEY) === '1'; } catch { /* no storage */ }
            if (forget) {
                await this.#fetchAuth(`${API_BASE}/forget-pretences`, { method: 'POST' });
                try { sessionStorage.removeItem(FORGET_PRETENCES_KEY); } catch { /* no storage */ }
            }

            // The server holds the pretence (so the deck can see it) and checks it against the actual
            // root media: a fresh install or a new upload collapses it.
            const res = await this.#fetchAuth(`${API_BASE}/root-media`);
            if (res.ok) {
                const result = (await res.json()) as RootMediaAudit;
                this._items = result.items;
                this._pretending = result.pretending;
            }
            this.#reportStatus();
        } finally {
            this._loading = false;
        }
    }

    #reportStatus() {
        const count = this._pretending ? 0 : this._items.length;
        this.dispatchEvent(new CustomEvent('sinners-status', {
            bubbles: true, composed: true,
            detail: { issueCount: count, severity: count > 0 ? 'error' : 'ok' },
        }));
    }

    async #pretend() {
        if (this._items.length === 0) return;
        const res = await this.#fetchAuth(`${API_BASE}/pretend-root-media`, { method: 'POST' });
        if (!res.ok) return;
        showMagic(() => {
            this._pretending = true;
            this.#reportStatus();
            absolved(3, 'pretend-media', true);
        });
    }

    override render() {
        const items = this._pretending ? [] : this._items;
        return html`
            <uui-box headline="III — The root is bare: no media at the root">
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : items.length === 0
                      ? html`<div class="clean">✓ No media items loose at root — everything is in a folder.</div>`
                      : html`
                            <div class="info">
                                ${items.length} media item(s) are sitting directly at root.
                                Move them into a folder.
                            </div>
                            ${items.map((item) => html`
                                <div class="item-row">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-type">${item.mediaTypeAlias}</span>
                                    <span class="item-date">${new Date(item.createDate).toLocaleDateString()}</span>
                                </div>
                            `)}
                            <uui-button class="pretend-btn" look="secondary" @click=${() => this.#pretend()}>
                                ✨ Let's pretend it's fixed
                            </uui-button>
                        `}
            </uui-box>
        `;
    }
}
