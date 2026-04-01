import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ large = false }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={large ? 'w-full max-w-xl mx-auto' : 'w-full max-w-md'}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par titre ou auteur…"
          className={`w-full rounded-full border border-ink/15 bg-cream-dark/80 text-ink placeholder:text-ink-light/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition ${
            large ? 'px-6 py-3.5 pl-12 text-base' : 'px-4 py-2.5 pl-10 text-sm'
          }`}
        />
        <svg className={`absolute top-1/2 -translate-y-1/2 text-ink-light/40 ${large ? 'left-4 w-5 h-5' : 'left-3 w-4 h-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          type="submit"
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent text-white rounded-full hover:bg-accent-light transition ${
            large ? 'px-5 py-2 text-sm' : 'px-3 py-1.5 text-xs'
          }`}
        >
          Chercher
        </button>
      </div>
    </form>
  )
}
