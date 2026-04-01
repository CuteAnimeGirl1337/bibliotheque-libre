#!/usr/bin/env python3
"""
Fast bulk French book collector from Project Gutenberg.
Uses concurrent downloads to collect 1000+ books quickly.

Usage:
    python collect_bulk.py --limit 1100
"""

import argparse
import json
import os
import re
import time
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

GUTENDEX_API = "https://gutendex.com/books"
OUTPUT_DIR = "french_books"
METADATA_DIR = os.path.join(OUTPUT_DIR, "_metadata")
CATALOG_FILE = os.path.join(OUTPUT_DIR, "catalog.json")

TEXT_MIME_PRIORITY = [
    "text/plain; charset=utf-8",
    "text/plain; charset=us-ascii",
    "text/plain; charset=iso-8859-1",
    "text/plain",
]

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "BibliothequeLibre/1.0 (educational project)"})


def sanitize_filename(name, max_len=80):
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name[:max_len]


def pick_best_text_url(formats):
    for mime in TEXT_MIME_PRIORITY:
        if mime in formats:
            url = formats[mime]
            if url.endswith(".zip"):
                continue
            return url, mime
    return None, None


def build_metadata(book):
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


def fetch_all_french_books(limit=1100):
    """Fetch book metadata from Gutendex API with pagination."""
    params = {"languages": "fr", "sort": "popular"}
    books = []
    url = GUTENDEX_API
    page = 1

    print(f"\nFetching French book catalog (target: {limit})...")
    while url and len(books) < limit:
        try:
            resp = SESSION.get(url, params=params if page == 1 else None, timeout=20)
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            print(f"  API error on page {page}: {e}")
            time.sleep(2)
            continue

        results = data.get("results", [])
        if not results:
            break

        books.extend(results)
        count = data.get("count", "?")
        print(f"  Page {page}: {len(books)}/{limit} fetched (Gutenberg has {count} French books)")

        url = data.get("next")
        page += 1
        time.sleep(0.4)  # polite but faster

    books = books[:limit]
    print(f"  Got {len(books)} book records\n")
    return books


def download_single_book(book):
    """Download one book. Returns (book, metadata, success) tuple."""
    book_id = book["id"]
    title = book.get("title", "Sans titre")
    safe_name = f"{book_id}_{sanitize_filename(title)}"
    txt_path = os.path.join(OUTPUT_DIR, f"{safe_name}.txt")
    meta_path = os.path.join(METADATA_DIR, f"{safe_name}.json")

    meta = build_metadata(book)

    # Already downloaded?
    if os.path.exists(txt_path):
        return meta, "skip"

    text_url, mime = pick_best_text_url(book.get("formats", {}))
    if not text_url:
        return meta, "no_text"

    try:
        resp = SESSION.get(text_url, timeout=30)
        resp.raise_for_status()
        text = resp.text

        if len(text) < 500:
            return meta, "too_short"

        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)

        meta["local_file"] = f"{safe_name}.txt"
        meta["char_count"] = len(text)
        meta["word_count_approx"] = len(text.split())

        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        return meta, "ok"
    except Exception as e:
        return meta, f"error: {e}"


def collect_books(books, workers=8):
    """Download all books using a thread pool."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(METADATA_DIR, exist_ok=True)

    catalog = []
    stats = {"ok": 0, "skip": 0, "no_text": 0, "too_short": 0, "error": 0}
    total = len(books)

    print(f"Downloading {total} books with {workers} workers...\n")

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(download_single_book, b): b for b in books}
        done = 0

        for future in as_completed(futures):
            done += 1
            meta, status = future.result()

            if status == "ok":
                stats["ok"] += 1
                catalog.append(meta)
                if stats["ok"] % 25 == 0 or done == total:
                    print(f"  [{done}/{total}] Downloaded: {stats['ok']} | Skipped: {stats['skip']} | Errors: {stats['error']}")
            elif status == "skip":
                stats["skip"] += 1
                catalog.append(meta)
            elif status == "no_text":
                stats["no_text"] += 1
            elif status == "too_short":
                stats["too_short"] += 1
            else:
                stats["error"] += 1

    # Save catalog
    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"Collection complete!")
    print(f"  Downloaded:  {stats['ok']}")
    print(f"  Skipped:     {stats['skip']} (already existed)")
    print(f"  No text:     {stats['no_text']}")
    print(f"  Too short:   {stats['too_short']}")
    print(f"  Errors:      {stats['error']}")
    print(f"  Total saved: {len(catalog)}")
    print(f"  Output:      {os.path.abspath(OUTPUT_DIR)}")
    print(f"{'=' * 60}")
    return catalog


def main():
    parser = argparse.ArgumentParser(description="Fast bulk French book collector")
    parser.add_argument("--limit", type=int, default=1100, help="Target number of books")
    parser.add_argument("--workers", type=int, default=8, help="Concurrent download threads")
    args = parser.parse_args()

    books = fetch_all_french_books(limit=args.limit)
    if not books:
        print("No books found!")
        return

    collect_books(books, workers=args.workers)


if __name__ == "__main__":
    main()
