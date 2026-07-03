# おえかきパズル 🧩

しゃしんから つくる、こども（4さい前後）むけの ジグソーパズル PWA です。
いまは 16ピース（4×4）で あそべます。
（難易度を増やすと「なんいど選び」画面が自動で表示されます → 下記参照）

- **PWA**: ホーム画面に追加でき、オフラインでも遊べます
- **タッチ操作**: ピースをドラッグ、または「タップで選ぶ→置き場をタップ」の2通り
- **シンプルなUI**: 大きなボタン・やさしい配色・かんせいのお祝い演出

---

## 動かす（ローカル）

ES モジュールと Service Worker を使うため、`file://` ではなく HTTP で配信します。

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

（`npx serve` など、任意の静的サーバでも可）

---

## あたらしいパズルを追加する

**写真を1枚入れて、設定を1行足すだけ**です。ビルドや他ファイルの変更は不要。

1. 写真を [`images/`](images/) に入れる（推奨: 横長 16:9 くらいのJPEG/PNG）
2. [`js/data/puzzles.js`](js/data/puzzles.js) の配列に1つ追加する:

   ```js
   {
     id: 'my-photo',                 // ユニークなID（半角英数）
     title: 'あたらしいえ',            // 画面に出る名前（ひらがな推奨）
     src: 'images/my-photo.jpg',     // 画像パス
     credit: '',                     // 権利表記（任意）
   },
   ```

3. （オフライン対応もするなら）[`service-worker.js`](service-worker.js) の
   `APP_SHELL` に画像パスを足し、`CACHE_VERSION` を1つ上げる。

→ ホーム画面に自動でカードが表示されます。

### 難易度（ピース数）を変える

[`js/config/difficulties.js`](js/config/difficulties.js) が唯一の定義元です。
配列を編集すれば、選択画面もパズル盤も自動で追従します。
（例: 小さい子向けに `4 / 9 / 16` に下げる、段階を増やす など）

---

## 公開する（GitHub Pages）

ビルド不要の静的サイトなので、そのまま公開できます。

1. GitHub の **Settings → Pages**
2. **Source** を `Deploy from a branch`、**Branch** を `main` / `/ (root)` に設定
3. 数分後、`https://<ユーザー名>.github.io/puzzle_app/` で公開されます

すべてのパスは相対指定なので、サブパス配信でも動作します。
`.nojekyll` を置いてあるため `js/` フォルダも Jekyll に処理されず配信されます。

---

## 構成

```
index.html                app shell（1ページ・JSで画面切替）
manifest.webmanifest      PWA マニフェスト
service-worker.js         オフラインキャッシュ
css/styles.css            デザインシステム（トークン・レイアウト・演出）
js/
  app.js                  起動・画面ルーティング・SW登録
  data/puzzles.js         ★パズル一覧（ここを編集して追加）
  config/difficulties.js  ★難易度（ピース数）の定義
  views/home.js           ホーム（カード一覧）
  views/difficulty.js     ピース数えらび
  views/puzzle.js         パズル盤・ピース・クリア処理
  ui/celebrate.js         かんせいの お祝い演出
images/                   パズル用の写真
icons/                    PWAアイコン
```

---

## クレジット

初期収録の写真は ©Disney（東京ディズニーシー）の画像です。
個人・家庭で楽しむ用途を想定しています。再配布や公開配布には適しません。
