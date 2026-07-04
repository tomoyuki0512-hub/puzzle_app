import { puzzles } from '../data/puzzles.js';
import { difficulties } from '../config/difficulties.js';

// なんいど（ピース数）えらび画面
export function renderDifficulty(app, navigate, { puzzleId }) {
  const puzzle = puzzles.find((p) => p.id === puzzleId) || puzzles[0];
  app.className = 'app';
  app.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'app-header with-back';
  header.innerHTML = `
    <button class="btn-back" type="button" aria-label="もどる">‹</button>
    <h1 class="app-title small">${puzzle.title}</h1>
  `;
  header.querySelector('.btn-back').addEventListener('click', () => navigate('home'));

  const preview = document.createElement('div');
  preview.className = 'difficulty-preview';
  preview.style.backgroundImage = `url('${puzzle.src}')`;

  const prompt = document.createElement('p');
  prompt.className = 'difficulty-prompt';
  prompt.textContent = 'ピースの かずを えらんでね';

  const choices = document.createElement('div');
  choices.className = 'difficulty-grid';

  difficulties.forEach((d) => {
    const btn = document.createElement('button');
    btn.className = 'difficulty-btn';
    btn.type = 'button';
    btn.innerHTML = `
      <span class="difficulty-num">${d.short}</span>
      <span class="difficulty-unit">ピース</span>
    `;
    btn.addEventListener('click', () =>
      navigate('puzzle', { puzzleId: puzzle.id, difficultyId: d.id })
    );
    choices.appendChild(btn);
  });

  app.appendChild(header);
  app.appendChild(preview);
  app.appendChild(prompt);
  app.appendChild(choices);
}
