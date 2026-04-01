import BookCard from './BookCard'
import { useInView } from '../hooks/useInView'

export default function BookGrid({ books, loading }) {
  const { ref, inView } = useInView()

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <div className="aspect-[3/4] skeleton" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-light text-lg font-serif italic">Aucun livre trouvé</p>
      </div>
    )
  }

  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {books.map((book, i) => (
        <div
          key={book.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(i, 12) * 40}ms`, animationFillMode: 'both' }}
        >
          <BookCard book={book} />
        </div>
      ))}
    </div>
  )
}
