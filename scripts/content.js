const feedSelectors = [
  // '#contents', // YouTube
  '[role="feed"]', // Facebook, Twitter
  '[data-testid="primaryColumn"]', // Twitter/X
  // Tiktok
  '#main-content-homepage_hot',
  '.video-feed',
  // YouTube
  '.shorts-container',
  'ytd-rich-grid-renderer',
  'ytd-watch-next-secondary-results-renderer',
  'ytd-comment-thread-renderer',
  'tp-yt-paper-spinner',
  '.ytp-endscreen-content',
  '.ytp-ce-element',
  '.ytp-autonav-endscreen-countdown-overlay',
  // Facebook
  '[data-pagelet*="Feed"]', // Facebook moderno
  '[data-pagelet*="Stories"]', // Facebook moderno
  // Instagram
  '.xw7yly9', // Instagram moderno
];

function removeFeeds() {
  feedSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
}

// Run immediately
removeFeeds();

// Stay alert for re-renders
const observer = new MutationObserver(removeFeeds);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Compatibilidad con Firefox
if ((chrome || browser).runtime) {
  console.log("Focus Guardian activo en este navegador.");
}
