import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface RootNodeModel {
    key: string;
    name: string;
    contentTypeAlias: string;
    contentTypeName: string;
    hasTemplate: boolean;
    templateAlias: string | null;
}

interface RootContentAuditResult {
    isClean: boolean;
    rootNodes: RootNodeModel[];
}

interface RootSanctuaryResult {
    success: boolean;
    message: string;
}

const API_BASE = '/umbraco/management/api/v1/sinners';

@customElement('sinners-root-content')
export class RootContentElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _result: RootContentAuditResult | null = null;
    @state() private _loading = true;
    @state() private _seeking = false;
    @state() private _sanctuaryMessage: string | null = null;

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
            padding: 12px 16px;
            font-size: 13px;
            color: var(--uui-color-text-alt, #666);
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            line-height: 1.5;
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

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
        }

        .badge.ok {
            background: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--sinners-on-bright, white);
        }

        .badge.error {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .action-row {
            padding: 14px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .sanctuary-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 700;
            border: none;
            background: var(--sinners-action-btn-bg, #1b264f);
            color: var(--sinners-action-btn-color, white);
            cursor: pointer;
        }

        .sanctuary-btn:hover { opacity: 0.88; }
        .sanctuary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sanctuary-message {
            margin: 14px 16px;
            padding: 14px 16px;
            border-radius: 4px;
            border-left: 4px solid var(--uui-color-positive-standalone, #0d7a54);
            background: var(--uui-color-surface-alt, #f7faf9);
            font-size: 13px;
            line-height: 1.6;
            color: var(--uui-color-text, #333);
        }

        .error-message {
            margin: 14px 16px;
            padding: 14px 16px;
            border-radius: 4px;
            border-left: 4px solid var(--uui-color-danger-standalone, #d42054);
            background: #fff5f7;
            font-size: 13px;
            color: var(--uui-color-danger-standalone, #d42054);
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('IX', this, [
            { label: 'Seek Root Sanctuary', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.sanctuary-btn')], run: () => this.#seekSanctuary() },
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
            const res = await this.#fetchAuth(`${API_BASE}/root-content-audit`);
            if (res.ok) this._result = (await res.json()) as RootContentAuditResult;

            const count = this._result?.rootNodes.filter((n) => n.hasTemplate).length ?? 0;
            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount: count, severity: count > 0 ? 'error' : 'ok' },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #seekSanctuary() {
        this._seeking = true;
        this._sanctuaryMessage = null;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/seek-root-sanctuary`, { method: 'POST' });
            if (res.ok) {
                const result = (await res.json()) as RootSanctuaryResult;
                this._sanctuaryMessage = result.success
                    ? result.message
                    : `⚠ ${result.message}`;
                if (result.success) {
                    await this.#load();
                    absolved(9, 'root-sanctuary');
                }
            }
        } finally {
            this._seeking = false;
        }
    }

    override render() {
        const result = this._result;
        const sinners = result?.rootNodes.filter((n) => n.hasTemplate) ?? [];

        return html`
            <uui-box headline="IX — A root node is not a rendering node">
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : result?.isClean
                      ? html`
                            <div class="clean">✓ No root node beareth a template. The root is unrenderable and righteous.</div>
                            ${this._sanctuaryMessage ? html`<div class="sanctuary-message">${this._sanctuaryMessage}</div>` : ''}
                            ${result.rootNodes.map((node) => html`
                                <div class="item-row">
                                    <span class="item-name">${node.name}</span>
                                    <span class="item-type">${node.contentTypeAlias}</span>
                                    <span class="badge ok">✓ Templateless</span>
                                </div>
                            `)}`
                      : html`
                            <div class="info">
                                ${sinners.length} root node(s) beareth a template. The Library now shelters thy shared
                                content — the root's only calling is to hold structure, never to render. Seek sanctuary below.
                            </div>
                            ${result?.rootNodes.map((node) => html`
                                <div class="item-row">
                                    <span class="item-name">${node.name}</span>
                                    <span class="item-type">${node.contentTypeAlias}${node.templateAlias ? ` → ${node.templateAlias}` : ''}</span>
                                    <span class="badge ${node.hasTemplate ? 'error' : 'ok'}">
                                        ${node.hasTemplate ? '✕ Rendereth' : '✓ Templateless'}
                                    </span>
                                </div>
                            `)}
                            ${this._sanctuaryMessage
                                ? html`<div class="sanctuary-message">${this._sanctuaryMessage}</div>`
                                : html`
                                    <div class="action-row">
                                        <button
                                            class="sanctuary-btn"
                                            ?disabled=${this._seeking}
                                            @click=${this.#seekSanctuary}>
                                            ${this._seeking ? '⏳ Building sanctuary...' : '⛪ Seek Root Sanctuary'}
                                        </button>
                                    </div>
                                `}
                        `}
            </uui-box>
        `;
    }
}
