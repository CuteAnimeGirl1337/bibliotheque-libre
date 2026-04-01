import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <nav className={`sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-ink/10 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 bg-ink text-cream rounded-lg flex items-center justify-center font-serif font-bold text-sm group-hover:bg-accent transition-colors shadow-sm">
            BL
          </div>
          <span className="font-serif font-bold text-lg text-ink hidden sm:block">
            Bibliothèque Libre
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un livre ou un auteur…"
              className="w-full px-4 py-2 pl-10 rounded-full bg-cream-dark/80 border border-ink/10 text-sm text-ink placeholder:text-ink-light/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <Link to="/" className="text-sm text-ink-light hover:text-accent transition-colors hidden sm:block">
          Catalogue
        </Link>
      </div>
    </nav>
  )
}
