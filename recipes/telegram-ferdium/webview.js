function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const _path = _interopRequireDefault(require('path'));

module.exports = (Ferdium, settings) => {
  // Safe smoke-test marker: proves that our Telegram Ferdium recipe loaded
  // without removing any Telegram capability.
  document.documentElement.dataset.telegramFerdiumRecipe = 'active';
  document.documentElement.classList.add('telegram-ferdium');

  const telegramVersion = document
    .querySelector('meta[property="og:url"]')
    ?.getAttribute('content');
  const isWebK = telegramVersion?.includes('/k/');

  const updateBadge = () => {
    if (!isWebK) return;

    let directCount = 0;
    let groupCount = 0;

    for (const element of document.querySelectorAll('.rp:not(.is-muted)')) {
      const badge = element.querySelector('.dialog-subtitle-badge');
      if (!badge) continue;

      const value = Ferdium.safeParseInt(badge.textContent);
      if (element.dataset.peerId > 0) directCount += value;
      else groupCount += value;
    }

    Ferdium.setBadge(directCount, groupCount);
  };

  const updateTitle = () => {
    const element = isWebK
      ? document.querySelector('.top .peer-title')
      : null;

    Ferdium.setDialogTitle(element ? element.textContent : '');
  };

  Ferdium.loop(() => {
    updateBadge();
    updateTitle();
  });

  Ferdium.injectCSS(_path.default.join(__dirname, 'service.css'));

  // V1 stays conservative until live DOM inspection. Telegram/internal HTTP
  // links remain inside the service; ordinary external links leave the webview.
  // A stricter chat/entity navigation policy is Phase 6 in IMPLEMENTATION_PLAN.
  document.addEventListener(
    'click',
    event => {
      const link = event.target.closest('a[href^="http"]');
      const button = event.target.closest('button[title^="http"]');
      if (!link && !button) return;

      const url = link ? link.getAttribute('href') : button.getAttribute('title');
      if (!url || Ferdium.isImage(link)) return;

      event.preventDefault();
      event.stopPropagation();

      if (
        settings.trapLinkClicks === true ||
        url.includes('t.me') ||
        url.includes('web.telegram.org')
      ) {
        window.location.href = url;
      } else {
        Ferdium.openNewWindow(url);
      }
    },
    true,
  );
};