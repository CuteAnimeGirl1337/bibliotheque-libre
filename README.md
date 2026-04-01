# 📚 French Public Domain Book Collector

A two-step pipeline to build a free French book library from Project Gutenberg.

## Quick Start

```bash
# 1. Install dependency
pip install requests

# 2. Collect books (downloads texts + metadata)
python collect_french_books.py --limit 50

# 3. Process into web-ready JSON (chapters, TOC, stats)
python process_books.py
```

## Step 1 — Collect Books

```bash
# Get the 50 most popular French books
python collect_french_books.py --limit 50

# Search for a specific author
python collect_french_books.py --search "victor hugo" --limit 20

# Filter by subject
python collect_french_books.py --subject "poetry" --limit 30

# Combine filters
python collect_french_books.py --search "balzac" --subject "fiction" --limit 40
```

**Output structure:**
```
french_books/
├── 17989_Les_Misérables.txt          # Raw book text
├── 13951_Le_Comte_de_Monte-Cristo.txt
├── catalog.json                       # Full catalog of collected books
└── _metadata/
    ├── 17989_Les_Misérables.json      # Per-book metadata
    └── 13951_Le_Comte_de_Monte-Cristo.json
```

## Step 2 — Process for Web

```bash
python process_books.py
```

This will:
- Strip Gutenberg headers/footers
- Detect and split chapters automatically
- Calculate reading time estimates
- Generate a master `books_db.json` catalog

**Output structure:**
```
web_data/
├── 17989_Les_Misérables.json    # Full book with chapters
├── 13951_Le_Comte_de_Monte-Cristo.json
└── books_db.json                 # Catalog (no chapter text, for listing pages)
```

**Each book JSON looks like:**
```json
{
  "id": 17989,
  "title": "Les Misérables",
  "authors": [{"name": "Hugo, Victor", "birth_year": 1802, "death_year": 1885}],
  "subjects": ["France -- History -- 19th century -- Fiction"],
  "stats": {
    "total_words": 530000,
    "chapter_count": 48,
    "reading_time_minutes": 2120
  },
  "table_of_contents": [
    {"index": 0, "title": "CHAPITRE I"},
    {"index": 1, "title": "CHAPITRE II"}
  ],
  "chapters": [
    {"title": "CHAPITRE I", "content": "En 1815, M. Charles-François-Bienvenu Myriel..."}
  ]
}
```

## Next Steps

Once you have `web_data/` populated, you can:

1. **Build a reading website** — Use the JSON files as your backend data
2. **Add search** — Index books with Lunr.js, MeiliSearch, or Algolia
3. **Use Claude API** — Power recommendations and summaries
4. **Deploy** — Host on Vercel, Netlify, or GitHub Pages (static site)

## Data Sources

| Source | URL | Notes |
|--------|-----|-------|
| Gutendex API | gutendex.com | JSON API for Project Gutenberg |
| Project Gutenberg | gutenberg.org | 70,000+ free ebooks |
| Wikisource FR | fr.wikisource.org | Community-proofread French texts |
| Gallica (BnF) | gallica.bnf.fr | French National Library digital collection |

## Legal

All books collected are **public domain** — their copyright has expired.
Project Gutenberg's license allows free redistribution of these texts.
