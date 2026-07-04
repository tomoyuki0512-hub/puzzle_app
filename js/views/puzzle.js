import { puzzles } from '../data/puzzles.js';
import { difficultyById, difficulties } from '../config/difficulties.js';
import { celebrate } from '../ui/celebrate.js';

// タイル(1ピース)の背景スタイルを計算する。
// 画像全体を cols×rows に切り出し、(c,r) の部分だけを見せる。
function tileStyle(el, src, c, r, cols, rows) {
  const px = cols <= 1 ? 0 : (c / (cols - 1)) * 100;
  const py = rows <= 1 ? 0 : (r / (rows - 1)) * 100;
  el.style.backgroundImage = `url('${src}')`;
  el.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
  el.style.backgroundPosition = `${px}% ${py}%`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function renderPuzzle(app, navigate, { puzzleId, difficultyId }) {
  const puzzle = puzzles.find((p) => p.id === puzzleId) || puzzles[0];
  const diff = difficultyById(difficultyId);
  const { cols, rows } = diff;
  const total = cols * rows;
  // なんいどが複数あるときだけ「選び直し」ができる
  const canChooseLevel = difficulties.length > 1;
  // 戻る先: 選択画面がある構成なら選択画面、単一ならホーム
  const goBack = () =>
    canChooseLevel ? navigate('difficulty', { puzzleId: puzzle.id }) : navigate('home');

  app.className = 'app app-puzzle'; // スクロールなしの固定レイアウト
  app.innerHTML = '';

  // ---- ヘッダー ----
  const header = document.createElement('header');
  header.className = 'app-header with-back puzzle-header';
  header.innerHTML = `
    <button class="btn-back" type="button" aria-label="もどる">‹</button>
    <span class="puzzle-progress" aria-live="polite">0 / ${total}</span>
    <span class="header-spacer" aria-hidden="true"></span>
  `;
  header.querySelector('.btn-back').addEventListener('click', goBack);

  // 1マス(ピース)のたて×よこ比率を画像の実寸から計算
  const cellAspect = () => {
    const w = probe.naturalWidth || 16;
    const h = probe.naturalHeight || 9;
    return (w * rows) / (h * cols);
  };

  // ---- あそび場(1段目): 左=完成図(かんせいず) / 右=パズル ----
  // 画像の向きに関わらず常にこの2カラム。サイズはJSで画面に収まるよう調整。
  const playArea = document.createElement('div');
  playArea.className = 'play-area';

  const reference = document.createElement('div');
  reference.className = 'reference';
  reference.innerHTML = `
    <div class="reference-img" style="background-image:url('${puzzle.src}')"></div>
    <span class="reference-label">かんせいず</span>
  `;

  // ---- 盤面(スロット) ----
  const boardWrap = document.createElement('div');
  boardWrap.className = 'board-wrap';

  const board = document.createElement('div');
  board.className = 'board';
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  // うっすら見本（ゴースト）
  const ghost = document.createElement('div');
  ghost.className = 'board-ghost';
  ghost.style.backgroundImage = `url('${puzzle.src}')`;
  boardWrap.appendChild(ghost);
  boardWrap.appendChild(board);

  const slots = [];
  for (let i = 0; i < total; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = String(i);
    board.appendChild(slot);
    slots.push(slot);
  }

  // ---- ピース置き場(トレイ) ----
  const tray = document.createElement('div');
  tray.className = 'tray';

  const refImg = reference.querySelector('.reference-img');

  playArea.appendChild(reference);
  playArea.appendChild(boardWrap);

  app.appendChild(header);
  app.appendChild(playArea);
  app.appendChild(tray);

  // アスペクト比を保ったまま (maxW, maxH) に収まる寸法を返す
  function fit(aspect, maxW, maxH) {
    let w = maxW, h = w / aspect;
    if (h > maxH) { h = maxH; w = h * aspect; }
    return { w: Math.floor(w), h: Math.floor(h) };
  }

  // 画面に収まるよう、盤面・完成図・ピースの実寸(px)を計算して割り当てる。
  // スクロールが出ないよう、常に利用可能な領域内に収める。
  function relayout() {
    if (!playArea.isConnected) {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport && window.visualViewport.removeEventListener('resize', onResize);
      return;
    }
    const imgAspect = (probe.naturalWidth || 16) / (probe.naturalHeight || 9);

    // --- 1段目: 左=完成図 / 右=盤面 ---
    const pa = playArea.getBoundingClientRect();
    const colGap = 16, labelH = 20;
    const halfW = Math.max(0, (pa.width - colGap) / 2);
    const halfH = Math.max(0, pa.height);
    const b = fit(imgAspect, halfW, halfH);
    boardWrap.style.width = b.w + 'px';
    boardWrap.style.height = b.h + 'px';
    board.style.width = b.w + 'px';
    board.style.height = b.h + 'px';
    const r = fit(imgAspect, halfW, Math.max(0, halfH - labelH));
    refImg.style.width = r.w + 'px';
    refImg.style.height = r.h + 'px';

    // --- 2段目: ピース。全ピースが領域に収まる最大サイズを探す ---
    const tr = tray.getBoundingClientRect();
    const a = cellAspect();               // ピースのよこ/たて比
    const pad = 12, pgap = 8;
    const availW = Math.max(0, tr.width - pad * 2);
    const availH = Math.max(0, tr.height - pad * 2);
    let bestW = 0;
    for (let c = 1; c <= total; c++) {
      const rowsN = Math.ceil(total / c);
      const pw = (availW - pgap * (c - 1)) / c;
      const ph = pw / a;
      if (pw > 0 && ph * rowsN + pgap * (rowsN - 1) <= availH) {
        if (pw > bestW) bestW = pw;
      }
    }
    if (bestW === 0) {                    // 念のためのフォールバック(高さ基準)
      const ph = (availH - pgap) / 2;
      bestW = Math.max(24, ph * a);
    }
    const pieceW = Math.max(24, Math.floor(bestW) - 1);
    tray.querySelectorAll('.piece').forEach((p) => {
      p.style.aspectRatio = String(a);
      p.style.width = pieceW + 'px';
    });
  }
  const onResize = () => requestAnimationFrame(relayout);

  // 画像読み込み後に正しい比率で再計算
  const probe = new Image();
  probe.onload = () => onResize();
  probe.src = puzzle.src;

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.visualViewport && window.visualViewport.addEventListener('resize', onResize);
  requestAnimationFrame(relayout);

  // ============ ゲームロジック ============
  const placed = new Set();
  let selectedEl = null; // タップ選択中のピース

  function updateProgress() {
    header.querySelector('.puzzle-progress').textContent = `${placed.size} / ${total}`;
  }

  function makePiece(index) {
    const c = index % cols;
    const r = Math.floor(index / cols);
    const piece = document.createElement('button');
    piece.type = 'button';
    piece.className = 'piece';
    piece.dataset.index = String(index);
    piece.style.aspectRatio = String(cellAspect()); // 1マス分の比率（読み込み後に補正）
    tileStyle(piece, puzzle.src, c, r, cols, rows);
    attachPointer(piece, index);
    return piece;
  }

  function deselect() {
    if (selectedEl) selectedEl.classList.remove('selected');
    selectedEl = null;
  }

  function wiggle(el) {
    el.classList.remove('wiggle');
    // reflow to restart animation
    void el.offsetWidth;
    el.classList.add('wiggle');
  }

  function placePiece(index, pieceEl) {
    const c = index % cols;
    const r = Math.floor(index / cols);
    const slot = slots[index];
    tileStyle(slot, puzzle.src, c, r, cols, rows);
    slot.classList.add('filled', 'pop');
    slot.addEventListener('animationend', () => slot.classList.remove('pop'), { once: true });
    placed.add(index);
    if (pieceEl && pieceEl.parentNode) pieceEl.parentNode.removeChild(pieceEl);
    deselect();
    updateProgress();
    if (placed.size === total) onComplete();
  }

  function tryPlaceAtSlot(slotEl, index, pieceEl) {
    const target = Number(slotEl.dataset.index);
    if (target === index && !placed.has(target)) {
      placePiece(index, pieceEl);
      return true;
    }
    wiggle(slotEl);
    return false;
  }

  // ---- タップ選択 → スロットタップ で配置 ----
  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      if (!selectedEl) return;
      const index = Number(selectedEl.dataset.index);
      tryPlaceAtSlot(slot, index, selectedEl);
    });
  });

  // ---- ドラッグ & タップ 両対応 ----
  function attachPointer(piece, index) {
    let startX = 0, startY = 0, dragging = false, ghostEl = null, pid = null;
    const THRESHOLD = 8;

    const onMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) > THRESHOLD) {
        dragging = true;
        piece.classList.add('dragging-src');
        ghostEl = piece.cloneNode(true);
        ghostEl.classList.add('drag-ghost');
        ghostEl.classList.remove('selected');
        ghostEl.style.width = `${piece.offsetWidth}px`;
        ghostEl.style.height = `${piece.offsetHeight}px`;
        document.body.appendChild(ghostEl);
      }
      if (dragging && ghostEl) {
        ghostEl.style.left = `${e.clientX}px`;
        ghostEl.style.top = `${e.clientY}px`;
      }
    };

    const onUp = (e) => {
      piece.removeEventListener('pointermove', onMove);
      piece.removeEventListener('pointerup', onUp);
      piece.removeEventListener('pointercancel', onUp);
      try { piece.releasePointerCapture(pid); } catch (_) {}

      if (dragging) {
        piece.classList.remove('dragging-src');
        if (ghostEl) ghostEl.style.display = 'none';
        const under = document.elementFromPoint(e.clientX, e.clientY);
        const slotEl = under && under.closest ? under.closest('.slot') : null;
        if (ghostEl) { ghostEl.remove(); ghostEl = null; }
        if (slotEl) {
          tryPlaceAtSlot(slotEl, index, piece);
        }
        dragging = false;
      } else {
        // タップ: 選択のトグル
        if (selectedEl === piece) {
          deselect();
        } else {
          deselect();
          selectedEl = piece;
          piece.classList.add('selected');
        }
      }
    };

    piece.addEventListener('pointerdown', (e) => {
      if (placed.has(index)) return;
      startX = e.clientX;
      startY = e.clientY;
      dragging = false;
      pid = e.pointerId;
      try { piece.setPointerCapture(pid); } catch (_) {}
      piece.addEventListener('pointermove', onMove);
      piece.addEventListener('pointerup', onUp);
      piece.addEventListener('pointercancel', onUp);
    });
  }

  // ---- クリア時 ----
  function onComplete() {
    board.classList.add('complete');
    ghost.classList.add('hide');
    setTimeout(() => celebrate(app), 300);

    const done = document.createElement('div');
    done.className = 'done-panel';
    done.innerHTML = `
      <p class="done-title">やったね！ かんせい！</p>
      <div class="done-actions">
        <button class="done-btn" data-act="again" type="button">もういっかい</button>
        ${canChooseLevel ? '<button class="done-btn" data-act="level" type="button">ピースをかえる</button>' : ''}
        <button class="done-btn primary" data-act="home" type="button">ほかのえ</button>
      </div>
    `;
    done.querySelector('[data-act="again"]').addEventListener('click', () =>
      navigate('puzzle', { puzzleId: puzzle.id, difficultyId: diff.id })
    );
    if (canChooseLevel) {
      done.querySelector('[data-act="level"]').addEventListener('click', () =>
        navigate('difficulty', { puzzleId: puzzle.id })
      );
    }
    done.querySelector('[data-act="home"]').addEventListener('click', () =>
      navigate('home')
    );
    setTimeout(() => app.appendChild(done), 700);
  }

  // ---- ピースを並べる(シャッフル) ----
  const order = shuffle([...Array(total).keys()]);
  order.forEach((index) => tray.appendChild(makePiece(index)));
  updateProgress();
}
