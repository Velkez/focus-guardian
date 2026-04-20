const feedSelectors = [
  '[role="feed"]',
  '[data-testid="primaryColumn"]',
  '#main-content-homepage_hot',
  '.video-feed',
  '.shorts-container',
  'ytd-rich-grid-renderer',
  'ytd-watch-next-secondary-results-renderer',
  'ytd-comment-thread-renderer',
  'tp-yt-paper-spinner',
  '.ytp-endscreen-content',
  '.ytp-ce-element',
  '.ytp-autonav-endscreen-countdown-overlay',
  '[data-pagelet*="Feed"]',
  '[data-pagelet*="Stories"]',
  '.xw7yly9',
  'ytd-reel-shelf-renderer',
  'ytd-reel-item-renderer',
  'ytd-rich-grid-slim-media',
  'ytd-rich-grid-row',
  'ytd-rich-section-renderer',
  'ytd-guide-entry-renderer',
  'ytd-mini-guide-entry-renderer',
  'grid-shelf-view-model',
  'ytm-shorts-lockup-view-model-v2',
  'ytm-shorts-lockup-view-model',
  '.ytGridShelfViewModelGridShelfRow',
  'yt-shelf-header-view-model',
];

const isShortsPage = () => {
  return window.location.pathname.startsWith('/shorts/') || 
         window.location.href.includes('/shorts/');
};

const hideShortsPage = () => {
  if (isShortsPage()) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:80vh;background:#0f0f0f;color:#fff;font-family:system-ui;flex-direction:column;gap:16px;text-align:center;padding:20px;"><h1 style="font-size:24px;">⛔ Shorts bloqueado</h1><p style="color:#aaa;">Focus Guardian evita que pierdas tiempo en Shorts.</p><a href="https://www.youtube.com" style="color:#3ea6ff;text-decoration:none;">Ir a YouTube →</a></div>';
    }
    document.body.style.background = '#0f0f0f';
    document.body.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach(el => el.remove());
  }
};

async function loadSelectors() {
  try {
    if (isShortsPage()) {
      hideShortsPage();
      return;
    }
    const response = await fetch(chrome.runtime.getURL('selectors.json'));
    if (response.ok) {
      const config = await response.json();
      const dynamicSelectors = [];
      Object.values(config.selectors).forEach(platform => {
        Object.values(platform).forEach(selector => {
          if (typeof selector === 'string' && !selector.includes(':has')) {
            dynamicSelectors.push(selector);
          }
        });
      });
      if (dynamicSelectors.length > 0) {
        dynamicSelectors.forEach(s => { if (!feedSelectors.includes(s)) feedSelectors.push(s); });
      }
      const cssSelectors = [];
      Object.values(config.selectors).forEach(platform => {
        Object.values(platform).forEach(selector => {
          if (typeof selector === 'string' && (selector.includes(':has') || selector.includes(':has-text'))) {
            cssSelectors.push(selector);
          }
        });
      });
      if (cssSelectors.length > 0) {
        const style = document.createElement('style');
        style.id = 'focus-guardian-shorts';
        style.textContent = cssSelectors.join(', ') + ' { display: none !important; }';
        (document.head || document.documentElement).appendChild(style);
      }
    }
  } catch (e) {
    console.warn('Focus Guardian: No se pudo cargar selectors.json', e);
  }
}

(async () => {
  await loadSelectors();
  if (isShortsPage()) {
    hideShortsPage();
  } else {
    safeRemoveFeeds();
  }
  initObserver();
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (isShortsPage()) {
        hideShortsPage();
      } else {
        safeRemoveFeeds();
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();

let observer = null;

function safeRemoveFeeds() {
  try {
    if (!document.body) return;
    
    feedSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          try {
            el.remove();
          } catch (e) {}
        });
      } catch (e) {}
    });
    
    try {
      document.querySelectorAll('ytd-guide-entry-renderer a[title="Shorts"]').forEach(el => {
        const parent = el.closest('ytd-guide-entry-renderer');
        if (parent) parent.remove();
      });
    } catch (e) {}
    
    try {
      document.querySelectorAll('ytd-mini-guide-entry-renderer a[title="Shorts"]').forEach(el => {
        const parent = el.closest('ytd-mini-guide-entry-renderer');
        if (parent) parent.remove();
      });
    } catch (e) {}
    
    try {
      document.querySelectorAll('yt-shelf-header-view-model').forEach(el => {
        if (el.textContent.includes('Shorts')) {
          el.closest('grid-shelf-view-model, ytd-item-section-renderer')?.remove();
        }
      });
    } catch (e) {}
    
  } catch (e) {
    console.warn('Focus Guardian: Error en removeFeeds:', e.message);
  }
}

function initObserver() {
  if (observer) {
    try { observer.disconnect(); } catch (e) {}
  }
  
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => {
      safeRemoveFeeds();
      initObserver();
    }, { once: true });
    return;
  }
  
  observer = new MutationObserver(safeRemoveFeeds);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'hidden', 'aria-hidden']
  });
}

(async () => {
  await loadSelectors();
  if (isShortsPage()) {
    hideShortsPage();
  } else {
    safeRemoveFeeds();
  }
  initObserver();
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (isShortsPage()) {
        hideShortsPage();
      } else {
        safeRemoveFeeds();
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
