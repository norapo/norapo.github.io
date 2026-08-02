# norapo.github.io

[Norapo](https://norapo.github.io)（目的地への方向と距離だけを iPhone と Apple Watch に表示する矢印ナビアプリ）の公式サイト。

公開 URL: **https://norapo.github.io/**

Astro（v7系・最新安定版）製の静的サイト。integrations は追加しない最小構成。

## 構成

```
astro.config.mjs           最小構成（site/base は未設定）
src/layouts/Base.astro     head 共通タグ + Header + Footer（ページ固有の title などは props）
src/components/Header.astro / Footer.astro   ヘッダー・フッターの正本
src/pages/index.astro              ホーム
src/pages/support.astro            /support/   よくある質問
src/pages/feedback.astro           /feedback/  フィードバック
src/pages/privacy.astro            /privacy/   プライバシーポリシー
src/pages/donate.astro             /donate/    開発者を支援する
src/pages/404.astro                /404.html   見つからないページ（自己完結・絶対パス。公開 URL 変更時に要更新）
public/assets/site.css     共有スタイル（カラートークン + 全コンポーネント）
public/assets/hero.js      ホームのヒーローアニメーション
public/assets/icon.svg     アプリアイコン（角丸込み。ヘッダー・favicon 兼用）
public/assets/img/         画像（スクショ・OGP 用。現状は空）
.github/workflows/deploy.yml   GitHub Pages への自動デプロイ（main への push で発火）
```

ページ内リンクは相対パス表記（`../` など）のまま維持しており、ルート配信（現在の Organization サイト）でもサブパス配下でもカスタムドメインでもそのまま動く。404 だけはルート絶対パス。

## ローカル開発

```bash
npm install
npm run dev
# → http://localhost:4321/
```

## ビルド

```bash
npm run build
# → dist/ に生成される
```

## 公開（GitHub Pages）

リポジトリは Organization サイト `norapo/norapo.github.io`（public 必須）。Settings → Pages → Build and deployment → Source: **GitHub Actions** 設定済みで、main へ push するだけで `.github/workflows/deploy.yml` が自動でビルド・公開する。

カスタムドメインへ移行する場合は Settings → Pages でドメインを設定し、`src/pages/404.astro` の絶対パス 3 箇所を更新する。

## 編集の約束

- **スタイルは `public/assets/site.css` のみ**に書く。ページ内 `<style>` は増やさない
- **ヘッダー・フッター・head 共通タグの正本は `src/components/Header.astro` / `Footer.astro` / `src/layouts/Base.astro`**。新規ページを追加したら `src/pages/` にファイルを追加し、`Base.astro` に渡す `root`（ページ階層に応じた相対パスの接頭辞。ルート: `"./"`、1 階層下: `"../"`）と `current`（ナビの現在地表示）を指定する
- アプリアイコンの正本は norapo 本体の `NorapoApp/AppIcon.icon`。変えたら `public/assets/icon.svg`・`public/assets/favicon-32.png`・`public/assets/apple-touch-icon.png` を作り直す（ImageMagick で SVG を直接レンダリングするのは transform 連鎖を崩すので禁止。既存 PNG のピクセル検査など SVG レンダリング以外の用途では使ってよい）
  - `favicon-32.png`（角丸込み・透過必須）: Chrome ヘッドレスで `icon.svg` を `<img>` で読み込む HTML をレンダリングし（Blink は SVG transform を正しく描く）、`sips -z 32 32` で縮小する
    ```bash
    cat > /tmp/icon.html <<'HTML'
    <!DOCTYPE html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    img{display:block;width:320px;height:320px}
    </style></head><body>
    <img src="file:///絶対パス/public/assets/icon.svg" width="320" height="320">
    </body></html>
    HTML
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --headless=new --disable-gpu --screenshot=/tmp/icon-320.png \
      --default-background-color=00000000 --window-size=320,320 \
      --force-device-scale-factor=1 "file:///tmp/icon.html"
    sips -z 32 32 /tmp/icon-320.png --out public/assets/favicon-32.png
    ```
    角丸の外側は必ずアルファ 0 の透過にする（`qlmanage -t` は透過背景を出せず白背景になるため favicon-32.png の生成には使わない）
  - `apple-touch-icon.png`（180x180・不透明必須）: `rx="0"` にした正方形版から `qlmanage -t -s 180 <svg> -o <出力先>` で生成（iOS は透過を黒で埋めるため不透明が正しい）
- 文言はストア掲載文・アプリ内文言と整合させる。正本は norapo 本体リポジトリの
  `docs/release-plan/store-listing-draft.md`（ストア文言）と `docs/release-plan/positioning.md`（訴求の骨格・文体規則）
- カラートークンの正は norapo 本体の `design/01-design-tokens.md`
