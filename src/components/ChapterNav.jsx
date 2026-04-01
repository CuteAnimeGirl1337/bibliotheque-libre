import { Link } from 'react-router-dom'

export default function ChapterNav({ bookId, currentIndex, totalChapters, chapters }) {
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < totalChapters - 1

  return (
    <div className="flex items-center justify-between gap-4 py-8 border-t border-ink/10">
      {hasPrev ? (
        <Link
          to={`/read/${bookId}/${currentIndex - 1}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink/5 text-ink-light hover:bg-accent/10 hover:text-accent transition-colors text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline truncate max-w-[200px]">
            {chapters?.[currentIndex - 1]?.title || 'Précédent'}
          </span>
          <span className="sm:hidden">Précédent</span>
        </Link>
      ) : <div />}

      <span className="text-xs text-ink-light/50">
        {currentIndex + 1} / {totalChapters}
      </span>

      {hasNext ? (
        <Link
          to={`/read/${bookId}/${currentIndex + 1}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink/5 text-ink-light hover:bg-accent/10 hover:text-accent transition-colors text-sm group"
        >
          <span className="hidden sm:inline truncate max-w-[200px]">
            {chapters?.[currentIndex + 1]?.title || 'Suivant'}
          </span>
          <span className="sm:hidden">Suivant</span>
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <Link
          to={`/book/${bookId}`}
          className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm hover:bg-accent-light transition-colors"
        >
          Terminé
        </Link>
      )}
    </div>
  )
}
