# norapo-site

[Norapo](https://github.com/ynoki10)（目的地への方向と距離だけを iPhone と Apple Watch に表示する矢印ナビアプリ）の公式サイト。

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

ページ内リンクは相対パス表記（`../` など）のまま維持しており、GitHub Pages のプロジェクトページ（`/norapo-site/` 配下）でもカスタムドメインでもそのまま動く。

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

1. GitHub に public リポジトリ `norapo-site` を作成して push
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**
3. 以後は main へ push するだけで `.github/workflows/deploy.yml` が自動でビルド・公開する

## 編集の約束

- **スタイルは `public/assets/site.css` のみ**に書く。ページ内 `<style>` は増やさない
- **ヘッダー・フッター・head 共通タグの正本は `src/components/Header.astro` / `Footer.astro` / `src/layouts/Base.astro`**。新規ページを追加したら `src/pages/` にファイルを追加し、`Base.astro` に渡す `root`（ページ階層に応じた相対パスの接頭辞。ルート: `"./"`、1 階層下: `"../"`）と `current`（ナビの現在地表示）を指定する
- アプリアイコンの正本は norapo 本体の `NorapoApp/AppIcon.icon`。変えたら `public/assets/icon.svg`・`public/assets/favicon-32.png`・`public/assets/apple-touch-icon.png` を作り直す。PNG 化は `qlmanage -t -s <サイズ> <svg> -o <出力先>`（ImageMagick は SVG の transform を崩すので使わない。apple-touch-icon は `rx="0"` にした正方形版から生成）
- 文言はストア掲載文・アプリ内文言と整合させる。正本は norapo 本体リポジトリの
  `docs/release-plan/store-listing-draft.md`（ストア文言）と `docs/release-plan/positioning.md`（訴求の骨格・文体規則）
- カラートークンの正は norapo 本体の `design/01-design-tokens.md`
