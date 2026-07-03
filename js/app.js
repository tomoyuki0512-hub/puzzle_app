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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}
