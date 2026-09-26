function instrumentEnvironment(webview) {
  webview.executeJavaScript(`
    (function() {
      if (!window.electron) window.electron = {};
      document.documentElement.dataset.telegramFerdiumShell = 'active';
    })();
  `);
}

module.exports = Ferdium =>
  class TelegramFerdium extends Ferdium {
    get events() {
      return {
        'load-commit': 'loadCommit',
      };
    }

    loadCommit(event) {
      instrumentEnvironment(event.target);
    }
  };