# Nishikie Lab 公式サイト

公開URL: https://naocgart-sudo.github.io/nishikie-lab/ （英語版 `/en/`）

GitHub のこの画面だけで更新できます。保存（Commit）してから1〜2分で反映されます。

## 「動きで見る」に動画・画像を足す

1. `assets` フォルダを開く → **Add file → Upload files** で動画（.mp4）や画像（.webp / .png / .jpg / .gif）を上げる
2. このページの一覧から **`media.json`** を開く → 鉛筆アイコン（編集）
3. 足したい位置に、下のかたまりを1つコピーして書き換える（前後のかたまりとの間に `,` を忘れずに）

```json
  {
    "file": "新しい動画.mp4",
    "ja": { "title": "見出し", "desc": "ひとこと説明" },
    "en": { "title": "Title", "desc": "Short description" }
  }
```

- **並び順 = 表示順**。上に書いたものが先に出ます
- 画像も同じ書き方で `"file": "xxx.webp"` にするだけ
- `"poster": "xxx.webp"` を足すと、再生前の1枚目にその画像を使います（無ければ動画の最初のコマ）
- `"wide": true` を足すと、横2枠ぶんの大きさで出ます
- `"hidden": true` を足すと、消さずに一時的に隠せます
- 書き間違えて読めなくなっても、サイトは壊れません（元の4本がそのまま出ます）

## 機能紹介の画像・動画を差し替える

**同じファイル名で上げ直すだけ**で置き換わります（`assets` → Add file → Upload files → 同名のファイルを選ぶ）。

| 場所 | ファイル |
|---|---|
| ひと筆＝ひとつの距離場 | `assets/f-distance.webp` |
| ブラシは読めるコード | `assets/f-code.webp` |
| AIに頼んでブラシを作る | `assets/f-ai.webp` |
| レイヤーマテリアル | `assets/f-materials.webp` |
| 深度と光（動画） | `assets/f-depth.mp4`（再生前の絵: `f-depth.webp`） |
| 動作環境の図 | `assets/f-specs.webp` |
| 筆えらび（動画） | `assets/f-picker.mp4`（再生前の絵: `f-picker.webp`） |
| テクスチャ筆（動画） | `assets/f-texbrush.mp4`（再生前の絵: `f-texbrush.webp`）※英語版は字幕なしの `f-ribbon.mp4` のまま |
| ベクターの線画（動画・正方形） | `assets/f-vecwarp.mp4`（再生前の絵: `f-vecwarp.webp`） |
| 混色 — 絵の具のように（動画） | `assets/f-pigment.mp4`（再生前の絵: `f-pigment.webp`） |
| UIテーマ | `assets/f-theme.webp` |
| 開発中: 水彩の筆（動画・3:2） | `assets/w-watercolor.mp4`（再生前の絵: `w-watercolor.webp`） |
| モバイル版のスクリーンショット（3枚） | `assets/m-1.webp` `m-2.webp` `m-3.webp`（縦長。9:19.5 で切り抜かれて表示されるので、縦長ならどんな比率でも可） |
| トップの作例 | `assets/dragon.webp` `assets/dragon-480.webp` `assets/dragon.jpg` |
| SNSで共有したときの画像 | `assets/og.jpg`（日本語）`assets/og-en.jpg`（英語）1200×630 |

形式が変わるとき（.png → .mp4 など）や文章を変えるときは、`index.html`（日本語）と `en/index.html`（英語）の該当箇所を書き換えます。

## 素材の目安

- 動画: 16:9、横1280px、10秒前後、**1本5MB以下**（音は鳴りません。ループ再生）
- 画像: 16:9、横1280px、.webp がいちばん軽い
- 1回のアップロードは合計25MBまで（GitHubの制限）

## モバイル版のスクリーンショットを差し替える

`assets/m-1.webp` `m-2.webp` `m-3.webp` を同じ名前で上げ直すだけです（.png でも可。その場合は `index.html` と `en/index.html` の `m-1.webp` を `m-1.png` に書き換える）。
実機のスクリーンショットをそのまま上げてかまいません。スマホの枠の中に収まるよう中央で切り抜かれます。
文章（「開発中」の説明）は `index.html` の `<section id="mobile">` にあります。モバイル版と水彩の筆の2つが `<div class="wip">` ずつ並んでいます。開発中の話題を足すときは `wip` のかたまりを1つコピーして書き換えます（左右は自動で交互になります）。

## 更新履歴を足すとき

`index.html` の `<div class="updates">` の `<dl>` に `<dt>バージョン <span>年月</span></dt><dd>内容</dd>` を1組足す（英語は `en/index.html` の同じ場所）。
検索エンジン向けの `"softwareVersion"` と `"dateModified"`（`<head>` の中）も合わせて直す。

## 価格を変えるとき

`index.html` と `en/index.html` の両方で、`price` を検索して2か所ずつ（ページの表示と、検索エンジン向けの `"price"`）。
