import { useSearchParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useBooks } from '../context/BooksContext'
import BookGrid from '../components/BookGrid'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { searchBooks, loading } = useBooks()

  const results = useMemo(() => searchBooks(query), [query, searchBooks])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <Link to="/" className="text-sm text-ink-light/60 hover:text-accent transition-colors">
          &larr; Retour au catalogue
        </Link>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-3">
          Résultats pour « {query} »
        </h1>
        <p className="text-sm text-ink-light mt-1">
          {results.length} livre{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
        </p>
      </div>

      <BookGrid books={results} loading={loading} />
    </div>
  )
}
