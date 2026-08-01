#!/usr/bin/env python3
"""partials/ の内容を各ページの <!-- partial:name --> ブロックへ反映する。

使い方:
    python3 scripts/sync-partials.py

partials/<name>.html を正本として、各ページ内の
    <!-- partial:<name> --> ... <!-- /partial:<name> -->
ブロックの中身を置き換える。{{root}} はページ階層に応じた相対プレフィックス
（ルート: "./"、1 階層下: "../"）に展開する。現在ページと一致するリンクには
aria-current="page" を付与する。

書き込みは全ページの生成に成功した場合のみ行う（途中失敗で一部だけ
更新された状態を残さない）。PAGES に載っていないのに partial マーカーを
持つ HTML があれば警告する。
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    "index.html",
    "support/index.html",
    "privacy/index.html",
    "donate/index.html",
    "feedback/index.html",
]
# partial マーカー検出の対象外（レビュー作業用・自己完結ページ）
SCAN_EXCLUDE = {".review", ".git", "404.html"}

BLOCK_RE = re.compile(
    r"<!-- partial:([\w-]+) -->.*?<!-- /partial:\1 -->", re.DOTALL
)
OPEN_RE = re.compile(r"<!-- partial:([\w-]+) -->")
CLOSE_RE = re.compile(r"<!-- /partial:([\w-]+) -->")


def render(name: str, prefix: str, page_dir: str | None) -> str:
    src = ROOT / "partials" / f"{name}.html"
    html = src.read_text(encoding="utf-8").rstrip("\n")
    html = html.replace("{{root}}", prefix)
    if page_dir:
        # href の直前に他属性が来ても拾えるようにする
        link_re = re.compile(r'<a\s(?![^>]*aria-current)([^>]*?)href="%s%s/"'
                             % (re.escape(prefix), re.escape(page_dir)))
        html, n = link_re.subn(
            r'<a aria-current="page" \1href="%s%s/"' % (prefix, page_dir), html
        )
        if f'href="{prefix}{page_dir}/"' in html and n == 0:
            print(f"warning: {name}.html 内の {page_dir} リンクに aria-current を付与できなかった", file=sys.stderr)
    return f"<!-- partial:{name} -->\n{html}\n<!-- /partial:{name} -->"


def check_markers(page: str, text: str) -> None:
    opens = OPEN_RE.findall(text)
    closes = CLOSE_RE.findall(text)
    if sorted(opens) != sorted(closes):
        print(f"warning: {page} の partial マーカーが開閉で食い違っている "
              f"(open={opens}, close={closes})", file=sys.stderr)


def main() -> int:
    # PAGES 追記漏れの検知
    for path in ROOT.rglob("*.html"):
        rel = path.relative_to(ROOT)
        if rel.parts[0] in SCAN_EXCLUDE or str(rel) in SCAN_EXCLUDE:
            continue
        if str(rel) not in PAGES and "<!-- partial:" in path.read_text(encoding="utf-8"):
            print(f"warning: {rel} は partial マーカーを持つが PAGES に載っていない", file=sys.stderr)

    # 2 フェーズ: まず全ページの新内容を生成し、成功したら書き込む
    results: list[tuple[Path, str, str]] = []
    for page in PAGES:
        path = ROOT / page
        if not path.exists():
            print(f"error: ページが見つからない: {page}", file=sys.stderr)
            return 1
        parts = Path(page).parts
        prefix = "../" * (len(parts) - 1) or "./"
        page_dir = parts[0] if len(parts) > 1 else None
        text = path.read_text(encoding="utf-8")
        check_markers(page, text)
        new = BLOCK_RE.sub(lambda m: render(m.group(1), prefix, page_dir), text)
        results.append((path, text, new))

    changed = []
    for path, old, new in results:
        if new != old:
            path.write_text(new, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))
    print("updated:", ", ".join(changed) if changed else "(差分なし)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
