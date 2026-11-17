import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface ViewSin {
    file: string;
    line: number;
    text: string;
    pattern: string;
    signature: string;
    isConfessed: boolean;
}

interface ViewConfessionResult {
    viewsFound: boolean;
    hits: ViewSin[];
}

const API_BASE = '/umbraco/management/api/v1/sinners';

// Commandment VII: views render, they don't search. Code can't be fixed from the backoffice, so the
// only absolution is confession: until then the Board only says how many sins hide in which file.
@customElement('sinners-views-confession')
export class ViewsConfessionElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _result: ViewConfessionResult | null = null;
    @state() private _loading = true;
    @state() private _confessing = false;

    static override styles = css`
        .clean {
            padding: 16px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .info {
            padding: 12px 16px;
            font-size: 13px;
            color: var(--uui-color-text-alt, #666);
            line-height: 1.6;
        }

        .file-row {
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            font-family: monospace;
            font-size: 13px;
        }

        .count {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            height: 22px;
            padding: 0 6px;
            border-radius: 11px;
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            color: var(--sinners-on-bright, white);
            background: var(--uui-color-danger-standalone, #d42054);
        }

        .hit {
            padding: 10px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .where {
            font-family: monospace;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .code {
            display: block;
            margin-top: 4px;
            padding: 6px 8px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-all;
            background: var(--uui-color-surface-emphasis, #f0f0f0);
        }

        .tag {
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            color: var(--sinners-on-bright, white);
            background: var(--uui-color-danger-standalone, #d42054);
        }

        .tag.confessed {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .confess-btn {
            margin: 12px 16px 16px;
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('VII', this, [
            { label: 'Confess', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.confess-btn')], run: () => this.#confess() },
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
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers ?? {}),
            },
        });
    }

    async #load() {
        this._loading = true;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/views-confession`);
            if (res.ok) this._result = (await res.json()) as ViewConfessionResult;
            this.#reportStatus();
        } finally {
            this._loading = false;
        }
    }

    #reportStatus() {
        const count = this._result?.hits.filter((h) => !h.isConfessed).length ?? 0;
        this.dispatchEvent(new CustomEvent('sinners-status', {
            bubbles: true, composed: true,
            detail: { issueCount: count, severity: count > 0 ? 'error' : 'ok' },
        }));
    }

    async #confess() {
        if (!this._result?.hits.some((h) => !h.isConfessed)) return;
        this._confessing = true;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/confess`, { method: 'POST' });
            if (res.ok) {
                this._result = (await res.json()) as ViewConfessionResult;
                this.#reportStatus();
                absolved(7, 'confess');
            }
        } finally {
            this._confessing = false;
        }
    }

    #renderUnconfessed(hits: ViewSin[]) {
        const files = new Map<string, number>();
        for (const h of hits) files.set(h.file, (files.get(h.file) ?? 0) + 1);
        return html`
            <div class="info">
                ${hits.length} sin(s) hide in thy views: tree walks and the content service, run on every
                request. A view shall render what it is given. The code cannot be fixed from here — but it can be confessed.
            </div>
            ${[...files.entries()].map(([file, count]) => html`
                <div class="file-row"><span>${file}</span><span class="count">${count}</span></div>
            `)}
            <uui-button class="confess-btn" look="primary" color="danger"
                ?disabled=${this._confessing}
                @click=${() => void this.#confess()}>
                ${this._confessing ? '⏳ Confessing…' : '🕯 Confess'}
            </uui-button>
        `;
    }

    #renderHits(hits: ViewSin[]) {
        return hits.map((h) => html`
            <div class="hit">
                <div>
                    <span class="where">${h.file}:${h.line} — ${h.pattern}</span>
                    <code class="code">${h.text}</code>
                </div>
                <span class="tag ${h.isConfessed ? 'confessed' : ''}">${h.isConfessed ? '✓ Confessed' : '✕ Unconfessed'}</span>
            </div>
        `);
    }

    override render() {
        const r = this._result;
        const hits = r?.hits ?? [];
        const unconfessed = hits.filter((h) => !h.isConfessed);
        return html`
            <uui-box headline="VII — Views render; they don’t search">
                ${this._loading && !r
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : !r?.viewsFound
                      ? html`<div class="info">No Views folder at the content root — nothing to confess.</div>`
                      : hits.length === 0
                        ? html`<div class="clean">✓ No view searcheth the tree. Thy views render what they are given.</div>`
                        : unconfessed.length > 0 && unconfessed.length === hits.length
                          ? this.#renderUnconfessed(hits)
                          : html`
                                <div class="info">
                                    ${unconfessed.length === 0
                                        ? html`Thou hast confessed. The code is as sinful as before; thy conscience is not.`
                                        : nothing}
                                </div>
                                ${this.#renderHits(hits)}
                                ${unconfessed.length > 0
                                    ? html`<uui-button class="confess-btn" look="primary" color="danger"
                                            ?disabled=${this._confessing}
                                            @click=${() => void this.#confess()}>🕯 Confess the rest</uui-button>`
                                    : nothing}
                            `}
            </uui-box>
        `;
    }
}
