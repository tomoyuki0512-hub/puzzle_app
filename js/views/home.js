import { puzzles } from '../data/puzzles.js';
import { difficulties } from '../config/difficulties.js';

// カードを押したときの遷移。なんいどが1つだけなら選択画面を飛ばして
// そのままパズルへ。2つ以上あるときは選択画面を表示する。
function openPuzzle(navigate, puzzleId) {
  if (difficulties.length <= 1) {
    navigate('puzzle', { puzzleId, difficultyId: difficulties[0].id });
  } else {
    navigate('difficulty', { puzzleId });
  }
}

// ホーム画面: puzzles.js の内容からカードを自動生成
export function renderHome(app, navigate) {
  app.className = 'app';
  app.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <h1 class="app-title">おえかきパズル</h1>
    <p class="app-subtitle">すきな えを えらんでね</p>
  `;

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  puzzles.forEach((p) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.type = 'button';
    card.setAttribute('aria-label', `${p.title} をあそぶ`);
    card.innerHTML = `
      <div class="card-thumb" style="background-image:url('${p.src}')"></div>
      <div class="card-body">
        <span class="card-title">${p.title}</span>
        ${p.credit ? `<span class="card-credit">${p.credit}</span>` : ''}
      </div>
    `;
    card.addEventListener('click', () => openPuzzle(navigate, p.id));
    grid.appendChild(card);
  });

  app.appendChild(header);
  app.appendChild(grid);
}
