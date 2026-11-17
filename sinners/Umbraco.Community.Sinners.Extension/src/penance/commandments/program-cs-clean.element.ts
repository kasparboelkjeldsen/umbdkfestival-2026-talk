import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';
import { showMagic } from '../magic.js';

interface ProgramCsAuditResult {
    found: boolean;
    isClean: boolean;
    useUmbracoSavedToVariable: boolean;
    extraMiddleware: string[];
    extraEndpoints: string[];
}

const API_BASE = '/umbraco/management/api/v1/sinners';

const BEFORE_CODE = `var i̸̖l̷̼l̴̮i̵̗g̸̫a̷̮l̶̼ = app.UseUmbraco();

i̸̖l̷̼l̴̮i̵̗g̸̫a̷̮l̶̼.WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });`;

const AFTER_CODE = `app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();`;

@customElement('sinners-program-cs-clean')
export class ProgramCsCleanElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _result: ProgramCsAuditResult | null = null;
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

        .not-found {
            padding: 16px;
            color: var(--uui-color-text-alt, #888);
            font-size: 13px;
        }

        .issue-list {
            padding: 8px 0;
        }

        .issue-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            font-size: 13px;
        }

        .issue-row:last-child { border-bottom: none; }

        .issue-icon {
            font-size: 15px;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .issue-body {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .issue-title {
            font-weight: 600;
            color: var(--uui-color-danger-standalone, #d42054);
        }

        .issue-detail {
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
            font-family: monospace;
        }

        .diff-block {
            display: flex;
            gap: 16px;
            padding: 16px;
            align-items: flex-start;
        }

        .diff-side {
            flex: 1;
            min-width: 0;
        }

        .diff-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
        }

        .diff-label.before { color: var(--uui-color-danger-standalone, #d42054); }
        .diff-label.after  { color: var(--uui-color-positive-standalone, #0d7a54); }

        .diff-arrow {
            font-size: 24px;
            padding-top: 42px;
            color: var(--uui-color-text-alt, #aaa);
            flex-shrink: 0;
        }

        pre {
            margin: 0;
            padding: 12px 14px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.6;
            white-space: pre;
            overflow-x: auto;
        }

        pre.before {
            background: #fff0f3;
            border: 1px solid #ffc0cb;
            color: #6b0020;
        }

        pre.after {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            color: #1a4731;
        }

        .fix-btn {
            margin: 0 16px 16px;
        }

    `;

    override connectedCallback() {
        super.connectedCallback();
        presenter.registerSteps('IV', this, [
            { label: 'Cleanse Program.cs', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.fix-btn')], run: () => this.#fix() },
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
            const res = await fetch(`${API_BASE}/program-cs-audit`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) this._result = (await res.json()) as ProgramCsAuditResult;

            const issues = this._result
                ? (this._result.useUmbracoSavedToVariable ? 1 : 0)
                  + this._result.extraMiddleware.length
                  + this._result.extraEndpoints.length
                : 0;
            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount: issues, severity: issues > 0 ? 'error' : 'ok' },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #fix() {
        const token = await this.#authCtx?.getLatestToken();
        await fetch(`${API_BASE}/fix-program-cs`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        showMagic(() => {
            absolved(4, 'cleanse-program-cs');
            void this.#load();
        });
    }

    #renderIssues(result: ProgramCsAuditResult) {
        const otherIssues: { title: string; detail: string }[] = [];

        for (const name of result.extraMiddleware)
            otherIssues.push({
                title: 'Non-standard middleware registered',
                detail: `u.${name}()  — found inside .WithMiddleware(...)`,
            });

        for (const name of result.extraEndpoints)
            otherIssues.push({
                title: 'Non-standard endpoint registered',
                detail: `u.${name}()  — found inside .WithEndpoints(...)`,
            });

        return html`
            ${result.useUmbracoSavedToVariable ? html`
                <div class="diff-block">
                    <div class="diff-side">
                        <div class="diff-label before">Before — thy sin</div>
                        <pre class="before">${BEFORE_CODE}</pre>
                    </div>
                    <div class="diff-arrow">→</div>
                    <div class="diff-side">
                        <div class="diff-label after">After — absolved</div>
                        <pre class="after">${AFTER_CODE}</pre>
                    </div>
                </div>
                <uui-button class="fix-btn" look="secondary" @click=${() => void this.#fix()}>
                    ✨ Apply the fix
                </uui-button>
            ` : ''}
            ${otherIssues.length > 0 ? html`
                <div class="issue-list">
                    ${otherIssues.map((issue) => html`
                        <div class="issue-row">
                            <span class="issue-icon">✕</span>
                            <div class="issue-body">
                                <span class="issue-title">${issue.title}</span>
                                <span class="issue-detail">${issue.detail}</span>
                            </div>
                        </div>
                    `)}
                </div>
            ` : ''}
        `;
    }

    override render() {
        const result = this._result;
        return html`
            <uui-box headline="IV — Compose in thy IComposer, not Program.cs">
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : !result || !result.found
                      ? html`<div class="not-found">Program.cs not found at the application root.</div>`
                      : result.isClean
                        ? html`<div class="clean">✓ Program.cs looks clean.</div>`
                        : this.#renderIssues(result)}
            </uui-box>
        `;
    }
}
