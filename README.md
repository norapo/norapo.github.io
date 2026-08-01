# norapo-site

[Norapo](https://github.com/ynoki10)（iPhone + Apple Watch の「方向と距離だけ」散歩ナビ）の公式サイト。

ビルドステップなしのプレーン静的サイト。依存ゼロ（アプリと同じ思想）。

## 構成

```
index.html              ホーム
support/index.html      /support/   よくある質問
feedback/index.html     /feedback/  フィードバック
privacy/index.html      /privacy/   プライバシーポリシー
donate/index.html       /donate/    開発者を支援する
404.html                見つからないページ（自己完結・絶対パス。公開 URL 変更時に要更新）
assets/site.css         共有スタイル（カラートークン + 全コンポーネント）
assets/hero.js          ホームのヒーローアニメーション
assets/icon.svg         アプリアイコン（角丸込み。ヘッダー・favicon 兼用）
assets/img/             画像（スクショ・OGP 用。現状は空）
partials/               ヘッダー・フッター・head 共通タグの正本
scripts/sync-partials.py  partials を各ページへ反映するスクリプト
scripts/git-hooks/      pre-commit（partials 同期漏れの検知）
.nojekyll               GitHub Pages の Jekyll 処理をスキップ
```

クローン直後に `git config core.hooksPath scripts/git-hooks` を実行する。

## ローカルプレビュー

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

リンクは相対パスなので、GitHub Pages のプロジェクトページ（`/norapo-site/` 配下）でもカスタムドメインでもそのまま動く。

## 公開（GitHub Pages）

1. GitHub に public リポジトリ `norapo-site` を作成して push
2. Settings → Pages → Build and deployment → **Deploy from a branch** → `main` / `/ (root)`
3. 以後は main へ push するだけで自動公開

## 編集の約束

- **スタイルは `assets/site.css` のみ**に書く。ページ内 `<style>` は増やさない
- **ヘッダー・フッター・favicon リンクの正本は `partials/`**。編集したら `python3 scripts/sync-partials.py` を実行して各ページへ反映する（各ページの `<!-- partial:name -->` ブロックの中身は直接編集しない）。新規ページを追加したらスクリプトの `PAGES` にも追記する
- アプリアイコンの正本は norapo 本体の `NorapoApp/AppIcon.icon`。変えたら `assets/icon.svg`・`assets/favicon-32.png`・`assets/apple-touch-icon.png` を作り直す。PNG 化は `qlmanage -t -s <サイズ> <svg> -o <出力先>`（ImageMagick は SVG の transform を崩すので使わない。apple-touch-icon は `rx="0"` にした正方形版から生成）
- 文言はストア掲載文・アプリ内文言と整合させる。正本は norapo 本体リポジトリの
  `docs/release-plan/store-listing-draft.md`（ストア文言）と `docs/release-plan/positioning.md`（訴求の骨格・文体規則）
- カラートークンの正は norapo 本体の `design/01-design-tokens.md`
