#!/usr/bin/env python3
"""partials/ の内容を各ページの <!-- partial:name --> ブロックへ反映する。

使い方:
    python3 scripts/sync-partials.py

partials/<name>.html を正本として、各ページ内の
    <!-- partial:<name> --> ... <!-- /partial:<name> -->
ブロックの中身を置き換える。{{root}} はページ階層に応じた相対プレフィックス
（ルート: "./"、1 階層下: "../"）に展開する。現在ページと一致するリンクには
aria-current="page" を付与する。
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

BLOCK_RE = re.compile(
    r"<!-- partial:([\w-]+) -->.*?<!-- /partial:\1 -->", re.DOTALL
)


def render(name: str, prefix: str, page_dir: str | None) -> str:
    src = ROOT / "partials" / f"{name}.html"
    html = src.read_text(encoding="utf-8").rstrip("\n")
    html = html.replace("{{root}}", prefix)
    if page_dir:
        needle = f'<a href="{prefix}{page_dir}/"'
        html = html.replace(needle, f'<a aria-current="page" href="{prefix}{page_dir}/"')
    return f"<!-- partial:{name} -->\n{html}\n<!-- /partial:{name} -->"


def main() -> int:
    changed = []
    for page in PAGES:
        path = ROOT / page
        if not path.exists():
            print(f"skip (not found): {page}", file=sys.stderr)
            continue
        parts = Path(page).parts
        prefix = "../" * (len(parts) - 1) or "./"
        page_dir = parts[0] if len(parts) > 1 else None
        text = path.read_text(encoding="utf-8")
        new = BLOCK_RE.sub(lambda m: render(m.group(1), prefix, page_dir), text)
        if new != text:
            path.write_text(new, encoding="utf-8")
            changed.append(page)
    print("updated:", ", ".join(changed) if changed else "(差分なし)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
