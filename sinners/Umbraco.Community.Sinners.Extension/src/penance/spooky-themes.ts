import type { ManifestTheme } from '@umbraco-cms/backoffice/themes';

function hexLerp(a: string, b: string, t: number): string {
    if (a.length !== 7 || b.length !== 7) return a; // skip alpha variants
    const ar = parseInt(a.slice(1, 3), 16);
    const ag = parseInt(a.slice(3, 5), 16);
    const ab = parseInt(a.slice(5, 7), 16);
    const br = parseInt(b.slice(1, 3), 16);
    const bg = parseInt(b.slice(3, 5), 16);
    const bb = parseInt(b.slice(5, 7), 16);
    const r = Math.round(ar + (br - ar) * t).toString(16).padStart(2, '0');
    const g = Math.round(ag + (bg - ag) * t).toString(16).padStart(2, '0');
    const bl = Math.round(ab + (bb - ab) * t).toString(16).padStart(2, '0');
    return `#${r}${g}${bl}`;
}

// level 1 = Umbraco's own dark theme
const L1: Record<string, string> = {
    '--uui-color-selected':                  '#316dca',
    '--uui-color-selected-emphasis':         '#3e79d0',
    '--uui-color-selected-standalone':       '#5b8dd7',
    '--uui-color-selected-contrast':         '#eeeeef',
    '--uui-color-current':                   '#316dca',
    '--uui-color-current-emphasis':          '#3e79d0',
    '--uui-color-current-standalone':        '#5b8dd7',
    '--uui-color-current-contrast':          '#eeeeef',
    '--uui-color-disabled':                  '#434c56',
    '--uui-color-disabled-standalone':       '#545d68',
    '--uui-color-disabled-contrast':         '#fcfcfc4d',
    '--uui-color-header-surface':            '#21262e',
    '--uui-color-header-contrast':           '#eeeeef',
    '--uui-color-header-contrast-emphasis':  '#eeeeef',
    '--uui-color-focus':                     '#316dca',
    '--uui-color-surface':                   '#2d333b',
    '--uui-color-surface-alt':               '#373e47',
    '--uui-color-surface-emphasis':          '#333a42',
    '--uui-color-background':                '#21262e',
    '--uui-color-text':                      '#eeeeef',
    '--uui-color-text-alt':                  '#eeeeef',
    '--uui-color-interactive':               '#eeeeef',
    '--uui-color-interactive-emphasis':      '#eeeeef',
    '--uui-color-border':                    '#434c56',
    '--uui-color-border-standalone':         '#545d68',
    '--uui-color-border-emphasis':           '#626e7b',
    '--uui-color-divider':                   '#373e47',
    '--uui-color-divider-standalone':        '#434c56',
    '--uui-color-divider-emphasis':          '#545d68',
    '--uui-color-default':                   '#316dca',
    '--uui-color-default-emphasis':          '#5387d5',
    '--uui-color-default-standalone':        '#eeeeef',
    '--uui-color-default-contrast':          '#eeeeef',
    '--uui-color-warning':                   '#af7c12',
    '--uui-color-warning-emphasis':          '#af7c12',
    '--uui-color-warning-standalone':        '#af7c12',
    '--uui-color-warning-contrast':          '#eeeeef',
    '--uui-color-danger':                    '#ca3b37',
    '--uui-color-danger-emphasis':           '#ca3b37',
    '--uui-color-danger-standalone':         '#ca3b37',
    '--uui-color-danger-contrast':           '#eeeeef',
    '--uui-color-positive':                  '#347d39',
    '--uui-color-positive-emphasis':         '#347d39',
    '--uui-color-positive-standalone':       '#347d39',
    '--uui-color-positive-contrast':         '#eeeeef',
};

// level 10 = hellscape: fire and brimstone. Charred surfaces, embers in the borders, flame-orange
// selection, sulphur warnings, warm firelit text
const L10: Record<string, string> = {
    '--uui-color-selected':                  '#e2440c',
    '--uui-color-selected-emphasis':         '#f45a14',
    '--uui-color-selected-standalone':       '#ff7a22',
    '--uui-color-selected-contrast':         '#fff3df',
    '--uui-color-current':                   '#e2440c',
    '--uui-color-current-emphasis':          '#f45a14',
    '--uui-color-current-standalone':        '#ff7a22',
    '--uui-color-current-contrast':          '#fff3df',
    '--uui-color-disabled':                  '#3a1407',
    '--uui-color-disabled-standalone':       '#4c1c0a',
    '--uui-color-disabled-contrast':         '#fcfcfc4d',
    '--uui-color-header-surface':            '#5a1302',
    '--uui-color-header-contrast':           '#ffcf7a',
    '--uui-color-header-contrast-emphasis':  '#fff0c2',
    '--uui-color-focus':                     '#ff8f1f',
    '--uui-color-surface':                   '#1f0904',
    '--uui-color-surface-alt':               '#2d0e05',
    '--uui-color-surface-emphasis':          '#280c05',
    '--uui-color-background':                '#0e0402',
    '--uui-color-text':                      '#ffe8c6',
    '--uui-color-text-alt':                  '#f4a35a',
    '--uui-color-interactive':               '#ffd08a',
    '--uui-color-interactive-emphasis':      '#fff0c2',
    '--uui-color-border':                    '#6a1f06',
    '--uui-color-border-standalone':         '#8a2c08',
    '--uui-color-border-emphasis':           '#b8410c',
    '--uui-color-divider':                   '#331006',
    '--uui-color-divider-standalone':        '#6a1f06',
    '--uui-color-divider-emphasis':          '#8a2c08',
    '--uui-color-default':                   '#c8360a',
    '--uui-color-default-emphasis':          '#e2440c',
    '--uui-color-default-standalone':        '#ffd08a',
    '--uui-color-default-contrast':          '#fff3df',
    '--uui-color-warning':                   '#d9a400',
    '--uui-color-warning-emphasis':          '#ebb800',
    '--uui-color-warning-standalone':        '#ffd23a',
    '--uui-color-warning-contrast':          '#1d0d00',
    '--uui-color-danger':                    '#ff2a0d',
    '--uui-color-danger-emphasis':           '#ff4a1c',
    '--uui-color-danger-standalone':         '#ff6a3a',
    '--uui-color-danger-contrast':           '#fff3df',
    '--uui-color-positive':                  '#8f8a12',
    '--uui-color-positive-emphasis':         '#a8a21a',
    '--uui-color-positive-standalone':       '#cfc83a',
    '--uui-color-positive-contrast':         '#1a1500',
};

function buildCss(level: number): string {
    const t = (level - 1) / 9; // 0 at level 1, 1 at level 10
    const lines = Object.keys(L1).map(
        (key) => `    ${key}: ${hexLerp(L1[key], L10[key], t)};`
    );
    lines.push('    --uui-color-scheme: dark;');
    lines.push('    --sinners-action-btn-bg: #e64241;');
    lines.push('    --sinners-action-btn-color: #ffffff;');
    // text on the danger / positive fills (badges, tags, banners): they turn bright, fiery orange
    // and sulphur yellow as the level rises, and white stops reading on them
    lines.push(`    --sinners-on-bright: ${level >= 5 ? '#1d0d00' : '#ffffff'};`);
    return `:root {\n${lines.join('\n')}\n}`;
}

export const SPOOKY_ALIAS = (level: number) => `sinners-spooky-${level}`;

export function registerSpookyThemes(extensionRegistry: { register: (m: ManifestTheme) => void }): void {
    for (let level = 1; level <= 10; level++) {
        const css = buildCss(level);
        extensionRegistry.register({
            type: 'theme',
            alias: SPOOKY_ALIAS(level),
            name: `☠ Sinners: Abyss (Level ${level})`,
            css: () => Promise.resolve({ default: css }),
            weight: 50 - level,
        });
    }
}
