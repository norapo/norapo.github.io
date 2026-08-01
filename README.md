# norapo-site

[Norapo](https://github.com/ynoki10)（iPhone + Apple Watch の「方向と距離だけ」散歩ナビ）の公式サイト。

ビルドステップなしのプレーン静的サイト。依存ゼロ（アプリと同じ思想）。

## 構成

```
index.html              ホーム
support/index.html      /support/   サポート（使い方・FAQ・フィードバック）
privacy/index.html      /privacy/   プライバシーポリシー
donate/index.html       /donate/    開発者を支援する
assets/site.css         共有スタイル（カラートークン + 全コンポーネント）
assets/img/             画像（スクショ・OGP 用。現状は空）
design/foundation/      デザイン参照（カラー・タイポグラフィの見本ページ）
.nojekyll               GitHub Pages の Jekyll 処理をスキップ
```

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
- **ヘッダー・フッターは全ページ手動同期**（4 ページなので許容。共通部分を変えたら全ページ確認）
- 文言はストア掲載文・アプリ内文言と整合させる。正本は norapo 本体リポジトリの
  `docs/release-plan/store-listing-draft.md`（ストア文言）と `docs/release-plan/positioning.md`（訴求の骨格・文体規則）
- カラートークンの正は norapo 本体の `design/01-design-tokens.md`
