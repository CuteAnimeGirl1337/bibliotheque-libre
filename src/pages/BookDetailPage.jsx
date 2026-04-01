import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useBooks } from '../context/BooksContext'
import { useBook } from '../hooks/useBook'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { useBookmarksContext } from '../context/BookmarksContext'
import { getBookColor, formatAuthor } from '../components/BookCard'
import FeaturedCarousel from '../components/FeaturedCarousel'

function formatReadingTime(minutes) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function BookDetailPage() {
  const { id } = useParams()
  const { getBookById, books, loading: catalogLoading } = useBooks()
  const { book: fullBook } = useBook(id)
  const { progress } = useReadingProgress(id)
  const { toggleBookmark, isBookmarked } = useBookmarksContext()

  const book = getBookById(id)
  const bookmarked = isBookmarked(Number(id))

  const similarBooks = useMemo(() => {
    if (!book?.subjects?.length || !books.length) return []
    const bookSubjects = new Set(book.subjects)
    return books
      .filter(b => b.id !== book.id && b.subjects?.some(s => bookSubjects.has(s)))
      .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
      .slice(0, 10)
  }, [book, books])

  if (catalogLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-1/2" />
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-32 w-full mt-8" />
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-ink mb-4">Livre introuvable</h1>
        <p className="text-ink-light mb-6">Ce livre n'existe pas dans notre catalogue.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-light active:scale-[0.96] transition-all">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  const author = book.authors?.[0]
  const toc = book.table_of_contents || []
  const [bgColor, textColor] = getBookColor(book.title)
  const readPercent = toc.length > 0 ? Math.round(((progress.chapterIndex || 0) / toc.length) * 100) : 0

  return (
    <div>
      {/* Hero banner with book color */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)` }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-20 relative z-10">
          <nav className="text-sm mb-6" style={{ color: textColor + '99' }}>
            <Link to="/" className="hover:underline">Catalogue</Link>
            <span className="mx-2">/</span>
            <span style={{ color: textColor + 'cc' }}>{book.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Cover */}
          <div className="shrink-0 w-36 sm:w-44 mx-auto sm:mx-0">
            <div className="aspect-[3/4] rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
              <div className="absolute inset-[10px] border border-white/15 rounded-sm pointer-events-none" />
              <div className="text-center px-4 relative z-10">
                <span className="text-5xl font-serif font-bold block mb-2" style={{ color: textColor }}>
                  {book.title.charAt(0)}
                </span>
                <span className="text-[9px] tracking-widest uppercase block opacity-60" style={{ color: textColor }}>
                  {author ? formatAuthor([author]) : ''}
                </span>
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-[5px]" style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1), rgba(255,255,255,0.05))'
              }} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-2 leading-tight">
              {book.title}
            </h1>

            {author && (
              <p className="text-lg text-ink-light mb-1">
                {formatAuthor([author])}
                {author.birth_year && (
                  <span className="text-sm text-ink-light/50 ml-2">
                    ({author.birth_year}–{author.death_year || '?'})
                  </span>
                )}
              </p>
            )}

            {/* Subjects */}
            {book.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 mb-5">
                {book.subjects.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-ink/5 rounded-full text-xs text-ink-light">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-cream-dark/50 rounded-xl mb-5 border border-ink/5">
              <div className="text-center">
                <div className="text-xl font-bold text-accent font-serif">
                  {book.stats?.total_words ? Math.round(book.stats.total_words / 1000) + 'k' : '–'}
                </div>
                <div className="text-xs text-ink-light">mots</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-accent font-serif">
                  {book.stats?.chapter_count || toc.length || '–'}
                </div>
                <div className="text-xs text-ink-light">chapitres</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-accent font-serif">
                  {book.stats?.reading_time_minutes ? formatReadingTime(book.stats.reading_time_minutes) : '–'}
                </div>
                <div className="text-xs text-ink-light">de lecture</div>
              </div>
            </div>

            {/* Reading progress */}
            {readPercent > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-ink-light/60">Votre progression</span>
                  <span className="text-xs font-medium text-accent">{readPercent}%</span>
                </div>
                <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${readPercent}%` }} />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/read/${book.id}/${progress.chapterIndex || 0}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light active:scale-[0.96] transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {progress.chapterIndex > 0 ? 'Reprendre la lecture' : 'Commencer la lecture'}
              </Link>
              <button
                onClick={() => toggleBookmark(Number(id))}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all active:scale-[0.96] ${
                  bookmarked
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'border border-ink/15 text-ink-light hover:bg-ink/5'
                }`}
              >
                <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {bookmarked ? 'Dans ma bibliothèque' : 'Ajouter à ma bibliothèque'}
              </button>
              <a
                href={book.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-ink/15 text-ink-light rounded-xl hover:bg-ink/5 transition-colors text-sm"
              >
                Source Gutenberg
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Table of contents */}
        {toc.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif font-bold text-xl text-ink mb-4">Table des matières</h2>
            <div className="bg-cream-dark/40 rounded-xl border border-ink/5 divide-y divide-ink/5">
              {toc.map((ch, i) => (
                <Link
                  key={i}
                  to={`/read/${book.id}/${i}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink/5 transition-colors group"
                >
                  <span className="text-sm text-ink-light/40 font-mono w-8 text-right shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink group-hover:text-accent transition-colors">
                    {ch.title}
                  </span>
                  {i === progress.chapterIndex && progress.chapterIndex > 0 && (
                    <span className="ml-auto text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      En cours
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Similar books */}
        {similarBooks.length > 0 && (
          <section className="mt-12">
            <FeaturedCarousel
              books={similarBooks}
              title="Livres similaires"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            />
          </section>
        )}
      </div>
    </div>
  )
}
