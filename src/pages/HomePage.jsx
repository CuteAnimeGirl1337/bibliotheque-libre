import { useState, useMemo } from 'react'
import { useBooks } from '../context/BooksContext'
import { useBookmarksContext } from '../context/BookmarksContext'
import { useCountUp } from '../hooks/useCountUp'
import SearchBar from '../components/SearchBar'
import BookGrid from '../components/BookGrid'
import FeaturedCarousel from '../components/FeaturedCarousel'

const SORT_OPTIONS = [
  { id: 'popular', label: 'Plus populaires' },
  { id: 'title', label: 'Titre A-Z' },
  { id: 'author', label: 'Auteur A-Z' },
  { id: 'shortest', label: 'Plus courts' },
  { id: 'longest', label: 'Plus longs' },
]

const TAG_COLORS = ['#c0392b','#8e44ad','#2980b9','#16a085','#d4a45e','#e67e22','#1abc9c','#9b59b6']

function sortBooks(books, sortBy) {
  const sorted = [...books]
  switch (sortBy) {
    case 'popular': return sorted.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
    case 'title': return sorted.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    case 'author': return sorted.sort((a, b) => (a.authors[0]?.name || '').localeCompare(b.authors[0]?.name || '', 'fr'))
    case 'shortest': return sorted.sort((a, b) => (a.stats?.total_words || 0) - (b.stats?.total_words || 0))
    case 'longest': return sorted.sort((a, b) => (b.stats?.total_words || 0) - (a.stats?.total_words || 0))
    default: return sorted
  }
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return Math.round(n / 1000) + 'k'
  return String(n)
}

const PAGE_SIZE = 40

// Floating book silhouettes for hero
const FLOAT_BOOKS = [
  { w: 14, h: 20, x: '8%', y: '15%', dur: '16s', delay: '0s', opacity: 0.06, color: '#d4a574' },
  { w: 10, h: 15, x: '25%', y: '60%', dur: '20s', delay: '2s', opacity: 0.05, color: '#85929e' },
  { w: 18, h: 26, x: '72%', y: '20%', dur: '18s', delay: '1s', opacity: 0.07, color: '#c8a45e' },
  { w: 12, h: 17, x: '55%', y: '70%', dur: '22s', delay: '3s', opacity: 0.04, color: '#c89eb8' },
  { w: 16, h: 22, x: '90%', y: '45%', dur: '19s', delay: '0.5s', opacity: 0.05, color: '#95d5b2' },
  { w: 8, h: 12, x: '40%', y: '30%', dur: '24s', delay: '4s', opacity: 0.04, color: '#dda15e' },
]

function StatBox({ target, label, suffix = '' }) {
  const { ref, value } = useCountUp(target)
  return (
    <div ref={ref}>
      <div className="text-2xl sm:text-3xl font-bold text-accent font-serif">{formatNumber(value)}{suffix}</div>
      <div className="text-xs text-ink-light mt-0.5">{label}</div>
    </div>
  )
}

export default function HomePage() {
  const { books, loading, stats, getSubjects, getBookById } = useBooks()
  const { bookmarks, isBookmarked } = useBookmarksContext()
  const [sortBy, setSortBy] = useState('popular')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const subjects = useMemo(() => getSubjects().slice(0, 20), [getSubjects])

  const popularBooks = useMemo(() =>
    [...books].sort((a, b) => (b.download_count || 0) - (a.download_count || 0)).slice(0, 15),
    [books]
  )

  const bookmarkedBooks = useMemo(() =>
    bookmarks.map(id => getBookById(id)).filter(Boolean),
    [bookmarks, getBookById]
  )

  const featuredAuthors = useMemo(() => {
    const authorMap = {}
    books.forEach(b => {
      const a = b.authors?.[0]
      if (!a) return
      if (!authorMap[a.name]) authorMap[a.name] = { ...a, count: 0, books: [] }
      authorMap[a.name].count++
      if (authorMap[a.name].books.length < 3) authorMap[a.name].books.push(b)
    })
    return Object.values(authorMap).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [books])

  const filteredBooks = useMemo(() => {
    let result = books
    if (selectedSubject) {
      result = result.filter(b => b.subjects?.includes(selectedSubject))
    }
    return sortBooks(result, sortBy)
  }, [books, sortBy, selectedSubject])

  useMemo(() => setVisibleCount(PAGE_SIZE), [sortBy, selectedSubject])

  const visibleBooks = filteredBooks.slice(0, visibleCount)
  const hasMore = visibleCount < filteredBooks.length

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-ink to-ink/90 text-cream py-16 sm:py-24 overflow-hidden">
        {/* Floating book silhouettes */}
        {FLOAT_BOOKS.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-sm pointer-events-none"
            style={{
              width: b.w, height: b.h, left: b.x, top: b.y,
              backgroundColor: b.color, opacity: b.opacity,
              animation: `${i % 2 === 0 ? 'float' : 'floatAlt'} ${b.dur} ease-in-out infinite`,
              animationDelay: b.delay,
            }}
          />
        ))}
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            Bibliothèque Libre
          </h1>
          <p className="text-cream/60 text-lg sm:text-xl mb-8 font-light">
            Des milliers de livres français gratuits du domaine public
          </p>
          <SearchBar large />
        </div>
      </section>

      {/* Stats with animated counting */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <div className="bg-cream-dark/70 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-6 flex items-center justify-around gap-4 text-center border border-ink/5">
          <StatBox target={stats.totalBooks} label="Livres" />
          <div className="w-px h-10 bg-ink/10" />
          <StatBox target={stats.totalWords} label="Mots" />
          <div className="w-px h-10 bg-ink/10" />
          <StatBox target={stats.totalAuthors} label="Auteurs" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Bookmarked books carousel */}
        {bookmarkedBooks.length > 0 && (
          <FeaturedCarousel
            books={bookmarkedBooks}
            title="Ma bibliothèque"
            icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
          />
        )}

        {/* Popular books carousel */}
        {popularBooks.length > 0 && (
          <FeaturedCarousel
            books={popularBooks}
            title="Livres populaires"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
        )}

        {/* Featured authors */}
        {featuredAuthors.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif font-bold text-xl text-ink mb-4 flex items-center gap-2">
              <span className="text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              Auteurs en vedette
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {featuredAuthors.map((a, i) => {
                const displayName = a.name.includes(', ') ? a.name.split(', ').reverse().join(' ') : a.name
                return (
                  <div key={a.name} className="shrink-0 w-[180px] p-4 bg-cream-dark/50 rounded-xl border border-ink/5 hover:border-accent/20 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Mini book stack */}
                      <div className="relative w-8 h-10 shrink-0">
                        {a.books.slice(0, 3).map((b, j) => (
                          <div key={j} className="absolute rounded-sm shadow-sm" style={{
                            width: 18, height: 24, left: j * 4, top: j * 2,
                            backgroundColor: ['#8b4513','#2c3e50','#4a0e2e'][j],
                            transform: `rotate(${-4 + j * 4}deg)`,
                          }} />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-xs text-ink truncate">{displayName}</p>
                        {a.birth_year && (
                          <p className="text-[10px] text-ink-light/50">{a.birth_year}–{a.death_year || '?'}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                      {a.count} livre{a.count > 1 ? 's' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Subject tags */}
        {subjects.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                !selectedSubject ? 'bg-accent text-white shadow-sm' : 'bg-ink/5 text-ink-light hover:bg-ink/10 hover:scale-105'
              }`}
            >
              Tous
            </button>
            {subjects.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(selectedSubject === s.name ? null : s.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 ${
                  selectedSubject === s.name
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-ink/5 text-ink-light hover:bg-ink/10 hover:scale-105'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                  backgroundColor: selectedSubject === s.name ? 'white' : TAG_COLORS[i % TAG_COLORS.length]
                }} />
                {s.name} <span className="opacity-50">({s.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Sort controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif font-bold text-xl text-ink">
            {selectedSubject || 'Tous les livres'}
            <span className="text-sm font-normal text-ink-light ml-2">({filteredBooks.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-light hidden sm:block">Trier par :</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs bg-ink/5 border-none rounded-lg px-3 py-2 text-ink-light focus:ring-2 focus:ring-accent/30 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Book grid */}
        <BookGrid books={visibleBooks} loading={loading} />

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-10 mb-4">
            <button
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="px-8 py-3 bg-ink/5 text-ink-light rounded-xl hover:bg-accent/10 hover:text-accent active:scale-[0.96] transition-all font-medium text-sm"
            >
              Voir plus de livres ({filteredBooks.length - visibleCount} restants)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
