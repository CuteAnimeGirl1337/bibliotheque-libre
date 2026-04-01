import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useBooks } from '../context/BooksContext'
import { useBook } from '../hooks/useBook'
import { useReadingProgress, useReaderPreferences } from '../hooks/useReadingProgress'
import { useScrollDirection } from '../hooks/useScrollDirection'
import ReadingProgressBar from '../components/ReadingProgressBar'
import ChapterNav from '../components/ChapterNav'
import TableOfContents from '../components/TableOfContents'
import ThemeToggle from '../components/ThemeToggle'
import FontSizeControl from '../components/FontSizeControl'
import BackToTopButton from '../components/BackToTopButton'

export default function ReaderPage() {
  const { id, chapterIndex } = useParams()
  const chIdx = Number(chapterIndex) || 0
  const navigate = useNavigate()

  const { getBookById } = useBooks()
  const { book: fullBook, loading, error } = useBook(id)
  const { saveProgress } = useReadingProgress(id)
  const { fontSize, setFontSize, theme, setTheme } = useReaderPreferences()
  const { direction, scrollY } = useScrollDirection()

  const [tocOpen, setTocOpen] = useState(false)

  const catalogEntry = getBookById(id)
  const controlsVisible = direction === 'up' || scrollY < 100

  // Save progress
  useEffect(() => {
    if (id && chIdx >= 0) saveProgress(chIdx)
  }, [id, chIdx, saveProgress])

  // Scroll to top on chapter change
  useEffect(() => { window.scrollTo(0, 0) }, [chIdx])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft' && chIdx > 0) navigate(`/read/${id}/${chIdx - 1}`)
      else if (e.key === 'ArrowRight' && fullBook && chIdx < fullBook.chapters.length - 1) navigate(`/read/${id}/${chIdx + 1}`)
      else if (e.key === 'Escape') setTocOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [chIdx, id, navigate, fullBook])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-4">
          <div className="skeleton h-8 w-2/3 mx-auto" />
          <div className="skeleton h-4 w-full mt-8" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
        </div>
      </div>
    )
  }

  if (error || !fullBook) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-ink mb-4">
          {error || 'Impossible de charger ce livre'}
        </h1>
        <p className="text-ink-light mb-6">Le texte de ce livre n'a pas pu être chargé.</p>
        <Link to={`/book/${id}`} className="inline-block px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-light active:scale-[0.96] transition-all">
          Retour au livre
        </Link>
      </div>
    )
  }

  const chapter = fullBook.chapters?.[chIdx]
  const toc = fullBook.table_of_contents || catalogEntry?.table_of_contents || []

  if (!chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-ink mb-4">Chapitre introuvable</h1>
        <Link to={`/book/${id}`} className="inline-block px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-light active:scale-[0.96] transition-all">
          Retour au livre
        </Link>
      </div>
    )
  }

  const paragraphs = chapter.content.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0)
  const chapterWords = chapter.content.split(/\s+/).length
  const minutesLeft = Math.ceil(chapterWords / 200)

  return (
    <div className={`font-size-${fontSize} min-h-screen`}>
      <ReadingProgressBar />

      {/* Glassmorphism top bar — auto-hide on scroll down */}
      <div className={`sticky top-0 z-30 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="bg-cream/60 backdrop-blur-xl backdrop-saturate-150 border-b border-ink/5 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTocOpen(true)}
                className="p-1.5 hover:bg-ink/10 rounded-lg transition active:scale-90"
                title="Table des matières"
              >
                <svg className="w-5 h-5 text-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
              <Link to={`/book/${id}`} className="text-sm text-ink-light hover:text-accent transition-colors truncate max-w-[200px]">
                {catalogEntry?.title || fullBook.title}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <FontSizeControl fontSize={fontSize} setFontSize={setFontSize} />
              <div className="w-px h-6 bg-ink/10" />
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
        </div>
      </div>

      {/* TOC sidebar */}
      <TableOfContents bookId={id} chapters={toc} currentIndex={chIdx} isOpen={tocOpen} onClose={() => setTocOpen(false)} />

      {/* Chapter content */}
      <article key={chIdx} className="animate-fade-in max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug">
            {chapter.title}
          </h1>
          <p className="text-sm text-ink-light/40 mt-2">
            Chapitre {chIdx + 1} sur {fullBook.chapters.length}
          </p>
          <p className="text-xs text-ink-light/30 mt-1">
            ~{minutesLeft} min de lecture
          </p>
        </header>

        <div className="reading-content text-ink/90">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'drop-cap' : undefined}>{p}</p>
          ))}
        </div>

        <ChapterNav
          bookId={id}
          currentIndex={chIdx}
          totalChapters={fullBook.chapters.length}
          chapters={toc}
        />
      </article>

      <BackToTopButton />
    </div>
  )
}
