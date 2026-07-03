import { renderHome } from './views/home.js';
import { renderDifficulty } from './views/difficulty.js';
import { renderPuzzle } from './views/puzzle.js';

const app = document.getElementById('app');

// ---- ごく簡単なビュー切り替え（履歴 = 戻る操作に対応） --------------
const routes = {
  home: () => renderHome(app, navigate),
  difficulty: (state) => renderDifficulty(app, navigate, state),
  puzzle: (state) => renderPuzzle(app, navigate, state),
};

function show(view, state = {}, push = true) {
  const render = routes[view] || routes.home;
  if (push) {
    history.pushState({ view, state }, '', `#${view}`);
  }
  render(state);
  window.scrollTo(0, 0);
}

// navigate はどのビューからも呼べる遷移関数
function navigate(view, state = {}) {
  show(view, state, true);
}

window.addEventListener('popstate', (e) => {
  const s = e.state || { view: 'home', state: {} };
  show(s.view, s.state, false);
});

// 初期表示
show('home', {}, true);

// ---- Service Worker 登録（PWA / オフライン対応） ------------------
if ('serviceWorker' in navigator) {
  // 既に古いSWに制御されている状態で新しいSWが有効化されたら、
  // 1回だけ自動リロードして最新表示に切り替える（更新の取りこぼし防止）。
  if (navigator.serviceWorker.controller) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((reg) => {
        // 定期的に更新チェック（起動時 + 1時間ごと）
        reg.update();
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('SW registration failed:', err);
      });
  });
}
