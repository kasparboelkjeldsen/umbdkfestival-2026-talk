import { LitElement, html, css, nothing } from 'lit';
import { presenter } from '../presenter.js';
import { absolved } from '../bridge.js';
import { customElement, property, state } from 'lit/decorators.js';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';

interface TranslationKeyIssue {
    itemKey: string;
    id: string;
    isPascalCase: boolean;
    unrecognizedWords: string[];
    isBlessed: boolean;
}

interface GroupSuggestionChild {
    itemKey: string;
    id: string;
}

interface GroupSuggestion {
    proposedParentKey: string;
    children: GroupSuggestionChild[];
}

interface TranslationAuditResult {
    issues: TranslationKeyIssue[];
    groupSuggestions: GroupSuggestion[];
}

const API_BASE = '/umbraco/management/api/v1/sinners';

// One dictionary audit, two commandments: mode="naming" is VI (keys are PascalCase English, dot-separated),
// mode="grouping" is III (dotted keys at the root belong under a parent that is only a folder).
@customElement('sinners-translation-audit')
export class TranslationAuditElement extends UmbElementMixin(LitElement) {
    #authCtx?: typeof UMB_AUTH_CONTEXT.TYPE;

    @property() mode: 'naming' | 'grouping' = 'naming';

    @state() private _result: TranslationAuditResult | null = null;
    @state() private _loading = true;
    @state() private _blessing = new Set<string>();
    @state() private _grouping = new Set<string>();

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
            align-items: center;
        }

        .issue-row:last-child { border-bottom: none; }
        .issue-row:hover { background: var(--uui-color-surface-alt, #fafafa); }
        .issue-row.blessed { opacity: 0.55; }

        .key {
            font-family: monospace;
            font-weight: 600;
            font-size: 13px;
        }

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
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

        .tag.error { background: var(--uui-color-danger-standalone, #d42054); color: var(--sinners-on-bright, white); }
        .tag.warning { background: #f0ac00; color: #1d0d00; }
        .tag code { font-family: monospace; font-weight: 400; opacity: 0.85; }

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
        .bless-btn.blessed { border-color: var(--uui-color-positive-standalone, #0d7a54); color: var(--uui-color-positive-standalone, #0d7a54); }
        .bless-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

        .group-row {
            padding: 12px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .group-row:last-child { border-bottom: none; }
        .group-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .proposed-parent {
            font-family: monospace;
            font-weight: 700;
            font-size: 13px;
            color: var(--uui-color-interactive, #1b264f);
        }

        .group-children {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 6px;
        }

        .child-chip {
            font-family: monospace;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 3px;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #555);
        }

        .group-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 5px 11px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: none;
            background: var(--sinners-action-btn-bg, #1b264f);
            color: var(--sinners-action-btn-color, white);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .group-btn:hover { opacity: 0.88; }
        .group-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `;

    override connectedCallback() {
        super.connectedCallback();
        if (this.mode === 'grouping') {
            presenter.registerSteps('III', this, [
                { label: 'Group all dictionary keys', clicks: () => [...(this.renderRoot as ParentNode).querySelectorAll('.group-btn')], run: () => this.#groupAll() },
            ], 'dictionary');
        }
        // Naming has no clicker step: the Clean starter kit's keys are all PascalCase English, so a
        // "bless the first key" beat would be a dead press. The Bless buttons still work by hand.
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
            const res = await this.#fetchAuth(`${API_BASE}/translation-audit`);
            if (res.ok) this._result = (await res.json()) as TranslationAuditResult;

            const result = this._result;
            const unblessedErrors = result?.issues.filter((i) => !i.isBlessed && !i.isPascalCase).length ?? 0;
            const unblessedWarnings = result?.issues.filter((i) => !i.isBlessed && i.isPascalCase && i.unrecognizedWords.length > 0).length ?? 0;
            const groups = result?.groupSuggestions.length ?? 0;
            const issueCount = this.mode === 'grouping' ? groups : unblessedErrors + unblessedWarnings;
            const severity = this.mode === 'grouping'
                ? (groups > 0 ? 'warning' : 'ok')
                : unblessedErrors > 0 ? 'error' : (issueCount > 0 ? 'warning' : 'ok');

            this.dispatchEvent(new CustomEvent('sinners-status', {
                bubbles: true, composed: true,
                detail: { issueCount, severity },
            }));
        } finally {
            this._loading = false;
        }
    }

    async #bless(item: TranslationKeyIssue, blessed: boolean) {
        this._blessing = new Set([...this._blessing, item.itemKey]);
        try {
            await this.#fetchAuth(`${API_BASE}/bless-translation`, {
                method: 'POST',
                body: JSON.stringify({ itemKey: item.itemKey, blessed }),
            });
            await this.#load();
            if (blessed) absolved(6, 'bless');
        } finally {
            this._blessing = new Set([...this._blessing].filter((k) => k !== item.itemKey));
        }
    }

    // The clicker groups the whole dictionary in one beat, and tells the deck once
    async #groupAll() {
        for (let guard = 0; guard < 50; guard++) {
            const next = this._result?.groupSuggestions[0];
            if (!next) break;
            await this.#createGroup(next, false);
        }
        absolved(3, 'group-dictionary');
    }

    async #createGroup(suggestion: GroupSuggestion, announce = true) {
        this._grouping = new Set([...this._grouping, suggestion.proposedParentKey]);
        try {
            await this.#fetchAuth(`${API_BASE}/create-translation-group`, {
                method: 'POST',
                body: JSON.stringify({
                    parentKey: suggestion.proposedParentKey,
                    childIds: suggestion.children.map((c) => c.id),
                }),
            });
            await this.#load();
            if (announce) absolved(3, 'group-dictionary');
        } finally {
            this._grouping = new Set([...this._grouping].filter((k) => k !== suggestion.proposedParentKey));
        }
    }

    #renderIssueSection(issues: TranslationKeyIssue[]) {
        if (issues.length === 0) return nothing;
        return html`
            ${issues.map((item) => {
                const isBlessing = this._blessing.has(item.itemKey);
                return html`
                    <div class="issue-row ${item.isBlessed ? 'blessed' : ''}">
                        <div>
                            <span class="key">${item.itemKey}</span>
                            <div class="tags">
                                ${!item.isPascalCase
                                    ? html`<span class="tag error">✕ Not PascalCase</span>`
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
                            title=${item.isBlessed ? 'Remove blessing' : 'Mark this key as intentionally named'}>
                            ${isBlessing ? '⏳' : item.isBlessed ? '✦ Blessed' : '✦ Bless'}
                        </button>
                    </div>
                `;
            })}
        `;
    }

    #renderGroupSection(suggestions: GroupSuggestion[]) {
        if (suggestions.length === 0) return nothing;
        return html`
            <div class="section-divider">Ungrouped keys</div>
            ${suggestions.map((s) => {
                const isGrouping = this._grouping.has(s.proposedParentKey);
                return html`
                    <div class="group-row">
                        <div>
                            <span class="proposed-parent">${s.proposedParentKey}</span>
                            <div class="group-children">
                                ${s.children.map((c) => html`<span class="child-chip">${c.itemKey}</span>`)}
                            </div>
                        </div>
                        <button
                            class="group-btn"
                            ?disabled=${isGrouping}
                            @click=${() => this.#createGroup(s)}
                            title="Create '${s.proposedParentKey}' as a parent and nest these keys under it">
                            ${isGrouping ? '⏳' : '⊞ Group'}
                        </button>
                    </div>
                `;
            })}
        `;
    }

    override render() {
        const result = this._result;
        const grouping = this.mode === 'grouping';
        const hasContent = grouping
            ? (result?.groupSuggestions.length ?? 0) > 0
            : (result?.issues.length ?? 0) > 0;
        const headline = grouping
            ? 'III — A folder is only a folder: dotted keys nest under a parent'
            : 'VI — Thy names: translation keys are PascalCase, dot-separated';
        const clean = grouping
            ? '✓ No dotted keys loose at the root — every group has its folder.'
            : '✓ All translation keys are PascalCase English.';

        return html`
            <uui-box headline=${headline}>
                ${this._loading
                    ? html`<uui-loader-bar></uui-loader-bar>`
                    : !hasContent || !result
                      ? html`<div class="clean">${clean}</div>`
                      : grouping
                        ? this.#renderGroupSection(result.groupSuggestions)
                        : this.#renderIssueSection(result.issues)}
            </uui-box>
        `;
    }
}
