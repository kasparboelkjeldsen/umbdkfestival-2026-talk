import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';

interface MissingProductionSetting {
    key: string;
    expectedValue: string;
    isBlessed: boolean;
}

interface ProductionReadinessResult {
    isReady: boolean;
    scannedFiles: string[];
    missingSettings: MissingProductionSetting[];
}

const API_BASE = '/umbraco/management/api/v1/sinners';

@customElement('sinners-production-settings')
export class ProductionSettingsElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @state() private _result: ProductionReadinessResult | null = null;
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

        .scanned {
            padding: 8px 16px 12px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .warning-header {
            padding: 12px 16px 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: var(--uui-color-warning-standalone, #92400e);
        }

        .warning-sub {
            padding: 0 16px 10px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .setting-row {
            padding: 10px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto auto;
            gap: 12px;
            align-items: center;
            background: color-mix(in srgb, #f0ac00 12%, var(--uui-color-surface, #fff));
        }

        .setting-row.blessed {
            opacity: 0.55;
            background: var(--uui-color-surface-alt, #fafafa);
        }

        .setting-key {
            font-family: monospace;
            font-size: 12px;
            color: var(--uui-color-text, #1c1917);
            word-break: break-all;
        }

        .setting-value {
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 3px;
            background: color-mix(in srgb, #f0ac00 30%, var(--uui-color-surface, #fff));
            color: var(--uui-color-text, #92400e);
            white-space: nowrap;
            border: 1px solid color-mix(in srgb, #f0ac00 70%, var(--uui-color-surface, #fff));
        }

        .setting-row.blessed .setting-value {
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #888);
            border-color: var(--uui-color-border-standalone, #ccc);
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
            color: var(--uui-color-text, #555);
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
        presenter.registerSteps('V', this, [
            { label: 'Bless all settings', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.bless-btn:not(.blessed)')], run: () => this.#blessAll() },
        ]);
        this.consumeContext(UMB_AUTH_CONTEXT, (ctx) => {
            this.#authCtx = ctx;
            void this.#load();
        });
    }

    async #blessAll() {
        // Bless whatever is unblessed, one at a time (each #bless refreshes _result),
        // with a hard cap so a misbehaving server can't loop us forever.
        for (let guard = 0; guard < 10; guard++) {
            const target = (this._result?.missingSettings ?? []).find((s) => !s.isBlessed);
            if (!target) break;
            console.log(`[RULE V] blessing "${target.key}"`);
            await this.#bless(target, true);
        }
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
            const res = await this.#fetchAuth(`${API_BASE}/production-readiness`);
            if (res.ok) this._result = (await res.json()) as ProductionReadinessResult;

            const unblessed = this._result?.missingSettings.filter((s) => !s.isBlessed).length ?? 0;
            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount: unblessed, severity: unblessed > 0 ? 'warning' : 'ok' },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #bless(setting: MissingProductionSetting, blessed: boolean) {
        this._blessing = new Set([...this._blessing, setting.key]);
        try {
            await this.#fetchAuth(`${API_BASE}/bless-production-setting`, {
                method: 'POST',
                body: JSON.stringify({ settingKey: setting.key, blessed }),
            });
            await this.#load();
            if (blessed) absolved(5, 'bless');
        } finally {
            this._blessing = new Set([...this._blessing].filter((k) => k !== setting.key));
        }
    }

    override render() {
        const result = this._result;
        const scannedLine = result
            ? html`<div class="scanned">Scanned: ${result.scannedFiles.join(', ')}</div>`
            : null;

        return html`
            <uui-box headline="V — A production site runs in production mode">
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : !result
                      ? null
                      : result.isReady
                        ? html`
                              <div class="clean">✓ Production settings found across your appsettings files.</div>
                              ${scannedLine}
                          `
                        : html`
                              <div class="warning-header">⚠ You better have a pipeline somewhere that sets these</div>
                              <div class="warning-sub">
                                  Scanned ${result.scannedFiles.join(', ')} — the following production settings were not found
                                  with valid values in any of them.
                              </div>
                              ${result.missingSettings.map((s) => {
                                  const isBlessing = this._blessing.has(s.key);
                                  return html`
                                      <div class="setting-row ${s.isBlessed ? 'blessed' : ''}">
                                          <span class="setting-key">${s.key}</span>
                                          <span class="setting-value">${s.expectedValue}</span>
                                          <button
                                              class="bless-btn ${s.isBlessed ? 'blessed' : ''}"
                                              ?disabled=${isBlessing}
                                              @click=${() => this.#bless(s, !s.isBlessed)}
                                              title=${s.isBlessed
                                                  ? 'Remove blessing — surface this setting as an issue again'
                                                  : 'My pipeline handles this — bless it'}>
                                              ${isBlessing ? '⏳' : s.isBlessed ? '✦ Blessed' : '✦ Bless'}
                                          </button>
                                      </div>
                                  `;
                              })}
                              ${scannedLine}
                          `}
            </uui-box>
        `;
    }
}
