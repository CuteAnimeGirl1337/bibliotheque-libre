#!/usr/bin/env python3
"""
📖 French Book Processor
=========================
Takes raw .txt files collected from Gutenberg and transforms them
into clean, structured JSON ready for a reading website.

- Strips Gutenberg headers/footers
- Detects and splits chapters
- Generates a table of contents
- Produces a single books_db.json for your frontend

Usage:
    python process_books.py                         # Process all books in ./french_books
    python process_books.py --input ./french_books   # Specify input dir
    python process_books.py --output ./web_data      # Specify output dir
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path


# ─── Configuration ───────────────────────────────────────────────────────────

INPUT_DIR = "french_books"
OUTPUT_DIR = "web_data"
DB_FILE = "books_db.json"

# Patterns to detect Gutenberg boilerplate
GUT_START_MARKERS = [
    r"\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG",
    r"\*\*\*\s*DÉBUT DE CE PROJET GUTENBERG",
    r"Produced by",
]
GUT_END_MARKERS = [
    r"\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG",
    r"\*\*\*\s*FIN DE CE PROJET GUTENBERG",
    r"End of (the )?Project Gutenberg",
]

# Patterns to detect chapter headings (French books)
CHAPTER_PATTERNS = [
    # "CHAPITRE I", "CHAPITRE PREMIER", "Chapitre 12"
    r"^(CHAPITRE|Chapitre)\s+(\w+|[IVXLCDM]+|\d+)\.?(\s*[-–—:.].*)?$",
    # "PREMIÈRE PARTIE", "Deuxième partie"
    r"^(\w+)\s+(PARTIE|Partie)\.?(\s*[-–—:.].*)?$",
    # "LIVRE PREMIER", "Livre III"
    r"^(LIVRE|Livre)\s+(\w+|[IVXLCDM]+|\d+)\.?(\s*[-–—:.].*)?$",
    # "TOME I", "Tome II"
    r"^(TOME|Tome)\s+(\w+|[IVXLCDM]+|\d+)\.?(\s*[-–—:.].*)?$",
    # "ACTE PREMIER", "Acte II" (for theatre)
    r"^(ACTE|Acte)\s+(\w+|[IVXLCDM]+|\d+)\.?(\s*[-–—:.].*)?$",
    # "I.", "II.", "III.", "IV." standalone Roman numerals
    r"^([IVXLCDM]+)\.?\s*$",
    # "I", "II" etc. on their own line (only short ones to avoid false positives)
    r"^(I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XIV|XV|XVI{0,3}|XIX|XX[IVXL]*)\.?\s*$",
]


# ─── Text cleaning ───────────────────────────────────────────────────────────

def strip_gutenberg_boilerplate(text: str) -> str:
    """Remove Project Gutenberg header and footer."""
    lines = text.split("\n")

    # Find start of actual content
    start_idx = 0
    for i, line in enumerate(lines):
        for pattern in GUT_START_MARKERS:
            if re.search(pattern, line, re.IGNORECASE):
                start_idx = i + 1
                # Skip blank lines after marker
                while start_idx < len(lines) and not lines[start_idx].strip():
                    start_idx += 1
                break

    # Find end of actual content
    end_idx = len(lines)
    for i in range(len(lines) - 1, start_idx, -1):
        for pattern in GUT_END_MARKERS:
            if re.search(pattern, lines[i], re.IGNORECASE):
                end_idx = i
                break

    return "\n".join(lines[start_idx:end_idx]).strip()


def clean_text(text: str) -> str:
    """Basic text cleanup."""
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Remove excessive blank lines (keep max 2)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    # Strip trailing whitespace per line
    lines = [line.rstrip() for line in text.split("\n")]
    return "\n".join(lines).strip()


# ─── Chapter detection ───────────────────────────────────────────────────────

def detect_chapters(text: str) -> list[dict]:
    """
    Split text into chapters based on heading patterns.
    Returns a list of {"title": str, "content": str}.
    """
    lines = text.split("\n")
    chapter_breaks = []

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        for pattern in CHAPTER_PATTERNS:
            if re.match(pattern, stripped):
                # Extra check: chapter headings are usually preceded by blank lines
                if i == 0 or (i > 0 and not lines[i - 1].strip()):
                    chapter_breaks.append((i, stripped))
                    break

    # If we found very few chapters, return as single chapter
    if len(chapter_breaks) < 2:
        return [{"title": "Texte intégral", "content": text.strip()}]

    chapters = []

    # Everything before the first chapter heading = preamble/preface
    if chapter_breaks[0][0] > 5:  # only if there's substantial text
        preamble = "\n".join(lines[: chapter_breaks[0][0]]).strip()
        if len(preamble) > 200:
            chapters.append({"title": "Préface", "content": preamble})

    # Build chapters
    for idx, (line_num, heading) in enumerate(chapter_breaks):
        # Content goes from this heading to the next (or end of text)
        if idx + 1 < len(chapter_breaks):
            end = chapter_breaks[idx + 1][0]
        else:
            end = len(lines)

        content_lines = lines[line_num + 1 : end]
        content = "\n".join(content_lines).strip()

        if content:  # skip empty chapters
            chapters.append({"title": heading, "content": content})

    return chapters


# ─── Processing pipeline ────────────────────────────────────────────────────

def process_single_book(txt_path: str, meta_path: str | None) -> dict | None:
    """Process one book file into structured data."""
    # Read raw text
    with open(txt_path, "r", encoding="utf-8", errors="replace") as f:
        raw_text = f.read()

    if len(raw_text) < 500:
        return None  # Too short, probably not a real book

    # Load metadata if available
    meta = {}
    if meta_path and os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

    # Clean text
    text = strip_gutenberg_boilerplate(raw_text)
    text = clean_text(text)

    # Detect chapters
    chapters = detect_chapters(text)

    # Build structured book
    book = {
        "id": meta.get("gutenberg_id", Path(txt_path).stem),
        "title": meta.get("title", Path(txt_path).stem),
        "authors": meta.get("authors", []),
        "subjects": meta.get("subjects", []),
        "languages": meta.get("languages", ["fr"]),
        "source": meta.get("gutenberg_url", ""),
        "download_count": meta.get("download_count", 0),
        "stats": {
            "total_chars": len(text),
            "total_words": len(text.split()),
            "chapter_count": len(chapters),
            "reading_time_minutes": round(len(text.split()) / 250),  # ~250 wpm
        },
        "table_of_contents": [
            {"index": i, "title": ch["title"]}
            for i, ch in enumerate(chapters)
        ],
        "chapters": chapters,
    }

    return book


def process_all_books(input_dir: str, output_dir: str):
    """Process all .txt books in the input directory."""
    os.makedirs(output_dir, exist_ok=True)
    meta_dir = os.path.join(input_dir, "_metadata")

    txt_files = sorted(Path(input_dir).glob("*.txt"))
    if not txt_files:
        print(f"❌ No .txt files found in {input_dir}")
        return

    print(f"\n📖 Processing {len(txt_files)} books from {input_dir}...\n")

    catalog = []
    for i, txt_path in enumerate(txt_files, 1):
        name = txt_path.stem
        meta_path = os.path.join(meta_dir, f"{name}.json")

        print(f"[{i}/{len(txt_files)}] Processing: {name[:60]}...")

        book = process_single_book(str(txt_path), meta_path)
        if not book:
            print(f"         ⏭️  Skipped (too short)")
            continue

        # Save individual book JSON
        book_file = os.path.join(output_dir, f"{name}.json")
        with open(book_file, "w", encoding="utf-8") as f:
            json.dump(book, f, ensure_ascii=False, indent=2)

        # Add to catalog (without full chapter text to keep catalog small)
        catalog_entry = {k: v for k, v in book.items() if k != "chapters"}
        catalog.append(catalog_entry)

        ch_count = book["stats"]["chapter_count"]
        word_count = book["stats"]["total_words"]
        reading = book["stats"]["reading_time_minutes"]
        print(f"         ✅ {ch_count} chapters, {word_count:,} words (~{reading} min read)")

    # Save master catalog
    db_path = os.path.join(output_dir, DB_FILE)
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"📊 Processing complete!")
    print(f"   📚 Books processed: {len(catalog)}")
    print(f"   📁 Output dir:      {os.path.abspath(output_dir)}")
    print(f"   📋 Catalog DB:      {os.path.abspath(db_path)}")
    total_words = sum(b["stats"]["total_words"] for b in catalog)
    print(f"   📝 Total words:     {total_words:,}")
    print(f"   ⏱️  Total reading:   ~{total_words // 250:,} minutes")
    print(f"{'=' * 60}")


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="📖 Process collected French books into web-ready JSON"
    )
    parser.add_argument(
        "--input", type=str, default=INPUT_DIR,
        help=f"Input directory with .txt files (default: {INPUT_DIR})"
    )
    parser.add_argument(
        "--output", type=str, default=OUTPUT_DIR,
        help=f"Output directory for JSON files (default: {OUTPUT_DIR})"
    )
    args = parser.parse_args()

    process_all_books(args.input, args.output)


if __name__ == "__main__":
    main()
