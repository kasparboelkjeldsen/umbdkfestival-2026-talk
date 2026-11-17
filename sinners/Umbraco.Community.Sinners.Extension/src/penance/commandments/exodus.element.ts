import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface ExodusSinner {
    kind: 'warehouse' | 'versions';
    nodeKey: string | null;
    name: string;
    contentTypeAlias: string;
    contentTypeName: string;
    count: number;
    threshold: number;
}

interface ExodusAudit {
    childThreshold: number;
    versionThreshold: number;
    exportFolder: string;
    sinners: ExodusSinner[];
}

interface ExodusResult {
    files: Array<{ file: string; count: number; kind: string }>;
    exportFolder: string;
    deletedNodes: number;
    prunedVersions: number;
    elapsedMs: number;
}

const API_BASE = '/umbraco/management/api/v1/sinners';

// Commandment VIII: Umbraco is not thy database. Warehouses (too many children of one type under one
// parent) and log tables (a node with too many versions) are exported to JSON and led out of the tree.
@customElement('sinners-exodus')
export class ExodusElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _audit: ExodusAudit | null = null;
    @state() private _loading = true;
    @state() private _leading = false;
    @state() private _result: ExodusResult | null = null;
    @state() private _error: string | null = null;

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

        .sinner {
            padding: 12px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: center;
        }

        .name {
            font-weight: 600;
            font-size: 13px;
        }

        .detail {
            margin-top: 3px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .detail code {
            font-family: monospace;
        }

        .count {
            font-size: 22px;
            font-weight: 800;
            color: var(--uui-color-danger-standalone, #d42054);
            white-space: nowrap;
        }

        .count small {
            font-size: 12px;
            font-weight: 600;
            color: var(--uui-color-text-alt, #888);
        }

        .banner {
            margin: 12px 16px 4px;
            padding: 10px 12px;
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.6;
            color: var(--sinners-on-bright, white);
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .banner.error {
            background: var(--uui-color-danger-standalone, #d42054);
        }

        .banner code {
            font-family: monospace;
        }

        .exodus-btn {
            margin: 12px 16px 16px;
        }
    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('VIII', this, [
            { label: 'Exodus', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.exodus-btn')], run: () => this.#exodus() },
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
            const res = await this.#fetchAuth(`${API_BASE}/exodus-audit`);
            if (res.ok) this._audit = (await res.json()) as ExodusAudit;
            const count = this._audit?.sinners.length ?? 0;
            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount: count, severity: count > 0 ? 'error' : 'ok' },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #exodus() {
        if (!this._audit?.sinners.length) return;
        this._leading = true;
        this._error = null;
        try {
            const res = await this.#fetchAuth(`${API_BASE}/exodus`, { method: 'POST' });
            if (!res.ok) {
                this._error = `The sea did not part (HTTP ${res.status}).`;
                return;
            }
            this._result = (await res.json()) as ExodusResult;
            await this.#load();
            absolved(8, 'exodus');
        } catch (e) {
            this._error = String(e);
        } finally {
            this._leading = false;
        }
    }

    #renderSinner(s: ExodusSinner) {
        return html`
            <div class="sinner">
                <div>
                    <div class="name">${s.name}</div>
                    <div class="detail">
                        ${s.kind === 'warehouse'
                            ? html`${s.contentTypeName} nodes (<code>${s.contentTypeAlias}</code>) under one parent — a warehouse, not a website. Limit ${s.threshold}.`
                            : html`${s.contentTypeName} (<code>${s.contentTypeAlias}</code>) saved again and again — a log table in disguise. Limit ${s.threshold} versions.`}
                    </div>
                </div>
                <div class="count">${s.count} <small>${s.kind === 'warehouse' ? 'children' : 'versions'}</small></div>
            </div>
        `;
    }

    #renderResult(r: ExodusResult) {
        return html`
            <div class="banner">
                Let my content go. ${r.deletedNodes} node(s) left the tree and ${r.prunedVersions} version(s) were pruned,
                in ${(r.elapsedMs / 1000).toFixed(1)} s. They dwell now in
                ${r.files.map((f, i) => html`${i > 0 ? ', ' : ''}<code>${r.exportFolder}/${f.file}</code>`)} —
                put them in a real database.
            </div>
        `;
    }

    override render() {
        const a = this._audit;
        return html`
            <uui-box headline="VIII — Umbraco is not thy database">
                ${this._result ? this.#renderResult(this._result) : nothing}
                ${this._error ? html`<div class="banner error">${this._error}</div>` : nothing}
                ${this._loading && !a
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : !a || a.sinners.length === 0
                      ? html`<div class="clean">✓ No warehouses, no log tables. Thy content tree holdeth only content.</div>`
                      : html`
                            <div class="info">
                                More than ${a.childThreshold} children of one type under one parent, or more than
                                ${a.versionThreshold} versions of one node: that is data, and data belongeth in a database.
                            </div>
                            ${a.sinners.map((s) => this.#renderSinner(s))}
                            <uui-button class="exodus-btn" look="primary" color="danger"
                                ?disabled=${this._leading}
                                @click=${() => void this.#exodus()}>
                                ${this._leading ? '⏳ Parting the sea…' : '🌊 Exodus: export and lead them out'}
                            </uui-button>
                        `}
            </uui-box>
        `;
    }
}
