// かんせい したときの お祝いエフェクト（星・紙ふぶき）
// 外部ライブラリなし。DOM + CSS アニメーションだけで完結。

const PIECES = ['⭐', '🌟', '✨', '🎉', '🎊', '💖', '🌈'];

export function celebrate(container) {
  const layer = document.createElement('div');
  layer.className = 'celebrate-layer';

  const count = 36;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = PIECES[Math.floor(Math.random() * PIECES.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const dur = 1.6 + Math.random() * 1.4;
    const size = 18 + Math.random() * 26;
    const drift = (Math.random() * 2 - 1) * 60;
    s.style.left = `${left}%`;
    s.style.fontSize = `${size}px`;
    s.style.animationDelay = `${delay}s`;
    s.style.animationDuration = `${dur}s`;
    s.style.setProperty('--drift', `${drift}px`);
    layer.appendChild(s);
  }

  container.appendChild(layer);
  // 後片付け
  setTimeout(() => layer.remove(), 3600);
}
