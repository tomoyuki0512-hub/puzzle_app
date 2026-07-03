// ============================================================
//  パズルの一覧（ここだけ編集すれば新しいパズルを追加できます）
// ------------------------------------------------------------
//  新しいパズルの追加方法:
//   1. 写真を images/ フォルダに入れる（推奨: 横長 16:9 くらい）
//   2. 下の配列に { id, title, src, credit } を1つ追加する
//  → ホーム画面に自動でカードが表示されます。
//
//  id     : 半角英数字のユニークなID（保存や識別に使用）
//  title  : 画面に表示する名前（ひらがな推奨・こども向け）
//  src    : 画像のパス（images/ からの相対）
//  credit : 権利表記（任意。カードの隅に小さく表示）
// ============================================================

export const puzzles = [
  {
    id: 'disneysea-night-mickey',
    title: 'ほしぞらのミッキー',
    src: 'images/disneysea-night-mickey.jpg',
    credit: '©Disney',
  },
  {
    id: 'disneysea-25th-castle',
    title: 'キラキラ25しゅうねん',
    src: 'images/disneysea-25th-castle.jpg',
    credit: '©Disney',
  },
  {
    id: 'disneysea-mermaid-lagoon',
    title: 'にんぎょのラグーン',
    src: 'images/disneysea-mermaid-lagoon.jpg',
    credit: '©Disney',
  },
];
