import { Link } from 'react-router-dom'

export default function TableOfContents({ bookId, chapters, currentIndex, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-cream z-50 shadow-2xl animate-slide-in overflow-y-auto theme-dark:bg-navy">
        <div className="p-5 border-b border-ink/10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg">Table des matières</h2>
            <button onClick={onClose} className="p-1 hover:bg-ink/10 rounded transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-3">
          {chapters.map((ch, i) => (
            <Link
              key={i}
              to={`/read/${bookId}/${i}`}
              onClick={onClose}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                i === currentIndex
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-ink-light hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <span className="text-ink-light/40 text-xs mr-2">{i + 1}.</span>
              {ch.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
