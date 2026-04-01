#!/usr/bin/env python3
"""
📚 French Public Domain Book Collector
=======================================
Collects free French-language books from Project Gutenberg
via the Gutendex API (https://gutendex.com).

Each book is saved as a .txt file with a companion .json metadata file.

Usage:
    python collect_french_books.py                  # Collect first 50 books
    python collect_french_books.py --limit 200      # Collect 200 books
    python collect_french_books.py --search "hugo"  # Search by author/title
    python collect_french_books.py --subject "fiction" --limit 100

Requirements:
    pip install requests
"""

import argparse
import json
import os
import re
import time
import sys

try:
    import requests
except ImportError:
    print("❌ 'requests' is required. Install it with:  pip install requests")
    sys.exit(1)


# ─── Configuration ───────────────────────────────────────────────────────────

GUTENDEX_API = "https://gutendex.com/books"
OUTPUT_DIR = "french_books"
METADATA_DIR = os.path.join(OUTPUT_DIR, "_metadata")
CATALOG_FILE = os.path.join(OUTPUT_DIR, "catalog.json")
REQUEST_DELAY = 1.0  # seconds between API calls (be polite to the server)

# Preferred text formats in order of priority
TEXT_MIME_PRIORITY = [
    "text/plain; charset=utf-8",
    "text/plain; charset=us-ascii",
    "text/plain; charset=iso-8859-1",
    "text/plain",
    "text/html; charset=utf-8",
    "text/html",
]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def sanitize_filename(name: str, max_len: int = 80) -> str:
    """Turn a book title into a safe filename."""
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name[:max_len]


def pick_best_text_url(formats: dict) -> tuple[str, str]:
    """
    From a Gutenberg 'formats' dict, pick the best plain-text download URL.
    Returns (url, mime_type) or (None, None).
    """
    for mime in TEXT_MIME_PRIORITY:
        if mime in formats:
            url = formats[mime]
            # Skip zip files — we want raw text
            if url.endswith(".zip"):
                continue
            return url, mime
    return None, None


def download_text(url: str) -> str | None:
    """Download the full text of a book. Returns None on failure."""
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"    ⚠️  Download failed: {e}")
        return None


def build_metadata(book: dict) -> dict:
    """Extract clean metadata from a Gutendex book record."""
    authors = []
    for a in book.get("authors", []):
        entry = {"name": a.get("name", "Unknown")}
        if a.get("birth_year"):
            entry["birth_year"] = a["birth_year"]
        if a.get("death_year"):
            entry["death_year"] = a["death_year"]
        authors.append(entry)

    return {
        "gutenberg_id": book["id"],
        "title": book.get("title", "Sans titre"),
        "authors": authors,
        "subjects": book.get("subjects", []),
        "bookshelves": book.get("bookshelves", []),
        "languages": book.get("languages", []),
        "download_count": book.get("download_count", 0),
        "copyright": book.get("copyright", False),
        "gutenberg_url": f"https://www.gutenberg.org/ebooks/{book['id']}",
    }


# ─── Core collection logic ──────────────────────────────────────────────────

def fetch_book_list(search: str = None, subject: str = None, limit: int = 50) -> list[dict]:
    """
    Query the Gutendex API for French-language books.
    Returns a list of raw book records (up to `limit`).
    """
    params = {
        "languages": "fr",
        "sort": "popular",      # most-downloaded first
    }
    if search:
        params["search"] = search
    if subject:
        params["topic"] = subject

    books = []
    url = GUTENDEX_API
    page = 1

    print(f"\n🔍 Searching for French books (limit={limit})...")
    if search:
        print(f"   Filter: search=\"{search}\"")
    if subject:
        print(f"   Filter: subject=\"{subject}\"")

    while url and len(books) < limit:
        print(f"   📄 Fetching page {page}...")
        try:
            resp = requests.get(url, params=params if page == 1 else None, timeout=20)
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            print(f"   ❌ API error: {e}")
            break

        results = data.get("results", [])
        if not results:
            break

        books.extend(results)
        url = data.get("next")  # pagination
        page += 1
        time.sleep(REQUEST_DELAY)

    books = books[:limit]
    print(f"   ✅ Found {len(books)} books\n")
    return books


def collect_books(books: list[dict]) -> dict:
    """
    Download texts and save them alongside metadata.
    Returns a summary catalog dict.
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(METADATA_DIR, exist_ok=True)

    catalog = []
    success = 0
    skipped = 0

    for i, book in enumerate(books, 1):
        title = book.get("title", "Sans titre")
        book_id = book["id"]
        authors_str = ", ".join(a.get("name", "?") for a in book.get("authors", []))
        print(f"[{i}/{len(books)}] 📖 {title}")
        print(f"         ✍️  {authors_str or 'Auteur inconnu'}")

        # Check if already downloaded
        safe_name = f"{book_id}_{sanitize_filename(title)}"
        txt_path = os.path.join(OUTPUT_DIR, f"{safe_name}.txt")
        meta_path = os.path.join(METADATA_DIR, f"{safe_name}.json")

        if os.path.exists(txt_path):
            print("         ⏭️  Already exists, skipping")
            skipped += 1
            catalog.append(build_metadata(book))
            continue

        # Find a download URL
        text_url, mime = pick_best_text_url(book.get("formats", {}))
        if not text_url:
            print("         ⚠️  No plain-text format available, skipping")
            skipped += 1
            continue

        # Download
        print(f"         ⬇️  Downloading ({mime})...")
        text = download_text(text_url)
        if not text:
            skipped += 1
            continue

        # Save text
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)

        # Save metadata
        meta = build_metadata(book)
        meta["local_file"] = f"{safe_name}.txt"
        meta["char_count"] = len(text)
        meta["word_count_approx"] = len(text.split())
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        catalog.append(meta)
        success += 1
        print(f"         ✅ Saved ({meta['word_count_approx']:,} words)")
        time.sleep(REQUEST_DELAY)

    # Save full catalog
    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(f"📊 Collection complete!")
    print(f"   ✅ Downloaded: {success}")
    print(f"   ⏭️  Skipped:    {skipped}")
    print(f"   📁 Output dir:  {os.path.abspath(OUTPUT_DIR)}")
    print(f"   📋 Catalog:     {os.path.abspath(CATALOG_FILE)}")
    print("=" * 60)

    return catalog


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    global OUTPUT_DIR, METADATA_DIR, CATALOG_FILE

    parser = argparse.ArgumentParser(
        description="📚 Collect free French books from Project Gutenberg"
    )
    parser.add_argument(
        "--limit", type=int, default=50,
        help="Max number of books to collect (default: 50)"
    )
    parser.add_argument(
        "--search", type=str, default=None,
        help="Search by title or author (e.g. 'hugo', 'les misérables')"
    )
    parser.add_argument(
        "--subject", type=str, default=None,
        help="Filter by subject/topic (e.g. 'fiction', 'poetry', 'philosophy')"
    )
    parser.add_argument(
        "--output", type=str, default="french_books",
        help="Output directory (default: french_books)"
    )
    args = parser.parse_args()

    OUTPUT_DIR = args.output
    METADATA_DIR = os.path.join(OUTPUT_DIR, "_metadata")
    CATALOG_FILE = os.path.join(OUTPUT_DIR, "catalog.json")

    books = fetch_book_list(
        search=args.search,
        subject=args.subject,
        limit=args.limit,
    )

    if not books:
        print("😕 No books found. Try a different search or subject.")
        return

    collect_books(books)


if __name__ == "__main__":
    main()
