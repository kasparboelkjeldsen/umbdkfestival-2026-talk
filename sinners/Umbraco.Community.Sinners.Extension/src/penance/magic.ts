let stylesInjected = false;

function ensureStyles() {
    if (stylesInjected) return;
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sinners-magic-fade {
            0%   { opacity: 0; }
            20%  { opacity: 1; }
            80%  { opacity: 1; }
            100% { opacity: 0; }
        }
        .sinners-magic-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            background: rgba(0, 0, 0, 0.85) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: none !important;
            animation: sinners-magic-fade 1.8s ease forwards !important;
        }
        .sinners-magic-word {
            font-size: 96px !important;
            font-weight: 900 !important;
            font-style: italic !important;
            background: linear-gradient(90deg, #ff6b35, #f7c59f, #efefd0, #00b4d8, #9b5de5) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            white-space: nowrap !important;
        }
    `;
    document.head.appendChild(style);
    stylesInjected = true;
}

export function showMagic(onDone: () => void) {
    ensureStyles();

    const overlay = document.createElement('div');
    overlay.className = 'sinners-magic-overlay';

    const word = document.createElement('span');
    word.className = 'sinners-magic-word';
    word.textContent = '✨ Magic ✨';

    overlay.appendChild(word);
    document.documentElement.appendChild(overlay);

    setTimeout(() => { overlay.remove(); onDone(); }, 1800);
}
