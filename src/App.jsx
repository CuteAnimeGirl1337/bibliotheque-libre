import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import BookDetailPage from './pages/BookDetailPage'
import ReaderPage from './pages/ReaderPage'
import SearchResultsPage from './pages/SearchResultsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const location = useLocation()
  const isReaderPage = location.pathname.startsWith('/read/')

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isReaderPage && <Navbar />}
      <main className="flex-1">
        <div key={location.pathname} className="animate-fade-in">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/read/:id/:chapterIndex" element={<ReaderPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      {!isReaderPage && <Footer />}
    </div>
  )
}
