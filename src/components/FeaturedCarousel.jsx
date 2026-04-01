import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { getBookColor, formatAuthor } from './BookCard'

function getTitleExcerpt(title) {
  if (title.length <= 22) return title
  const cut = title.substring(0, 22)
  const last = cut.lastIndexOf(' ')
  return (last > 8 ? cut.substring(0, last) : cut) + '…'
}

export default function FeaturedCarousel({ books, title, icon }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  if (!books?.length) return null

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif font-bold text-xl text-ink flex items-center gap-2">
          {icon && <span className="text-accent">{icon}</span>}
          {title}
        </h2>
        <div className="flex gap-1.5">
          <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 active:scale-90 transition-all">
            <svg className="w-4 h-4 text-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scroll(1)} className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 active:scale-90 transition-all">
            <svg className="w-4 h-4 text-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style>{`.featured-scroll::-webkit-scrollbar { display: none; }`}</style>
        {books.map(book => {
          const [bg, text] = getBookColor(book.title)
          return (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="snap-start shrink-0 w-[160px] sm:w-[180px] group"
            >
              <div
                className="aspect-[3/4] rounded-lg overflow-hidden relative flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow"
                style={{ backgroundColor: bg }}
              >
                <div className="absolute inset-[8px] border border-white/15 rounded-sm pointer-events-none" />
                <div className="text-center px-3 relative z-10">
                  <span className="text-[10px] font-serif font-bold leading-snug block" style={{ color: text }}>
                    {getTitleExcerpt(book.title)}
                  </span>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-black/20" />
              </div>
              <h3 className="text-xs font-medium text-ink leading-tight line-clamp-1 group-hover:text-accent transition-colors">
                {book.title}
              </h3>
              <p className="text-[10px] text-ink-light/60 truncate">{formatAuthor(book.authors)}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
