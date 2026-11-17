import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { showMagic } from '../magic.js';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface USyncAuditResult {
    csprojFound: boolean;
    hasUSync: boolean;
    hasUmbracoDeploy: boolean;
    csprojName: string | null;
}

const API_BASE = '/umbraco/management/api/v1/sinners';

@customElement('sinners-usync-audit')
export class USyncAuditElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _result: USyncAuditResult | null = null;
    @state() private _loading = true;

    static override styles = css`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .error-block {
            padding: 16px;
        }

        .error-heading {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 14px;
            color: var(--uui-color-danger-standalone, #d42054);
            margin-bottom: 8px;
        }

        .error-body {
            font-size: 13px;
            color: var(--uui-color-text-alt, #666);
            line-height: 1.6;
        }

        .code {
            font-family: monospace;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
        }

        .warn-block {
            padding: 16px;
            font-size: 13px;
            color: var(--uui-color-text-alt, #888);
        }

        .pretend-btn {
            margin: 16px;
        }

    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('X', this, [
            { label: 'Pretend to uSync ✨', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.pretend-btn')], run: () => this.#pretend() },
        ]);
        this.consumeContext(UMB_AUTH_CONTEXT, (ctx) => {
            this.#authCtx = ctx;
            void this.#load();
        });
    }

    async #load() {
        this._loading = true;
        try {
            const token = await this.#authCtx?.getLatestToken();
            const res = await fetch(`${API_BASE}/usync-audit`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) this._result = (await res.json()) as USyncAuditResult;

            const r = this._result;
            const issueCount = r?.csprojFound && !r.hasUSync && !r.hasUmbracoDeploy ? 1 : 0;
            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount, severity: issueCount > 0 ? 'error' : 'ok' },
            }));
        } finally {
            this._loading = false;
        }
    }

    // The clicker step waits for the magic and the reload, so the next press (the end of the script)
    // can't reach the deck before the 'absolved' message does.
    async #pretend() {
        const token = await this.#authCtx?.getLatestToken();
        const res = await fetch(`${API_BASE}/inject-usync`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) console.warn(`[SINNERS] inject-usync answered ${res.status}`);
        await new Promise<void>((resolve) => showMagic(resolve));
        await this.#load();
        absolved(10, 'pretend-usync', true);
    }

    override render() {
        const r = this._result;

        return html`
            <uui-box headline="X — uSync when not on Umbraco Cloud">
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : !r?.csprojFound
                      ? html`<div class="warn-block">No .csproj file found at the content root — unable to inspect thy project.</div>`
                      : r.hasUSync
                        ? html`<div class="clean">✓ uSync is installed in <span class="code">${r.csprojName}</span> — thy schema walketh not alone.</div>`
                        : r.hasUmbracoDeploy
                          ? html`<div class="clean">✓ Umbraco.Deploy is installed in <span class="code">${r.csprojName}</span> — thy schema walketh not alone.</div>`
                          : html`
                                <div class="error-block">
                                    <div class="error-heading">✕ No schema versioning tool is installed</div>
                                    <div class="error-body">
                                        <span class="code">${r.csprojName}</span> contains no reference to
                                        <span class="code">uSync</span> or <span class="code">Umbraco.Deploy</span>.
                                        Without either, thy Document Types and Data Types exist only in the database —
                                        unversioned, undeployable, and one migration away from perdition.<br><br>
                                        Install <span class="code">uSync</span> (open-source) or
                                        <span class="code">Umbraco.Deploy</span> (commercial) and commit thy
                                        schema files to source control to be absolved.
                                    </div>
                                </div>
                                <uui-button class="pretend-btn" look="secondary" @click=${() => void this.#pretend()}>
                                    ✨ Let's pretend we have uSync
                                </uui-button>
                            `}
            </uui-box>
        `;
    }
}
