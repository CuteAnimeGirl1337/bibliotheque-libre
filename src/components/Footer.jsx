import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-16">
      {/* Decorative ornament */}
      <div className="flex justify-center -mt-3">
        <div className="bg-cream px-4">
          <svg width="48" height="12" viewBox="0 0 48 12" className="text-ink-light/20">
            <path d="M0 6h18m12 0h18M24 0l4 6-4 6-4-6z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-ink text-cream rounded-md flex items-center justify-center font-serif font-bold text-xs">
                BL
              </div>
              <span className="font-serif font-bold text-ink">Bibliothèque Libre</span>
            </div>
            <p className="text-xs text-ink-light/50 leading-relaxed">
              Votre bibliothèque numérique de livres français du domaine public. Lisez gratuitement les plus grands classiques de la littérature française.
            </p>
          </div>

          {/* Navigation */}
          <div className="sm:text-center">
            <h3 className="font-medium text-ink-light mb-3 text-xs uppercase tracking-wider">Navigation</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-xs text-ink-light/60 hover:text-accent transition-colors">Catalogue</Link>
              <Link to="/search?q=" className="text-xs text-ink-light/60 hover:text-accent transition-colors">Recherche</Link>
            </div>
          </div>

          {/* Credits */}
          <div className="sm:text-right">
            <h3 className="font-medium text-ink-light mb-3 text-xs uppercase tracking-wider">Sources</h3>
            <div className="flex flex-col gap-2">
              <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" className="text-xs text-ink-light/60 hover:text-accent transition-colors">
                Projet Gutenberg
              </a>
              <a href="https://gutendex.com" target="_blank" rel="noopener noreferrer" className="text-xs text-ink-light/60 hover:text-accent transition-colors">
                API Gutendex
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-ink/5 text-center">
          <p className="text-[10px] text-ink-light/30">
            Tous les textes sont dans le domaine public
          </p>
        </div>
      </div>
    </footer>
  )
}
