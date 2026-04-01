import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="text-6xl font-serif font-bold text-accent/30 mb-4">404</div>
      <h1 className="font-serif text-3xl font-bold text-ink mb-3">Page introuvable</h1>
      <p className="text-ink-light mb-8">
        Cette page n'existe pas. Peut-être cherchez-vous un livre ?
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Retour à l'accueil
      </Link>
    </div>
  )
}
