import { createContext, useContext, useState, useEffect } from 'react'

const BooksContext = createContext(null)

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/books_db.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load books catalog')
        return res.json()
      })
      .then(data => {
        setBooks(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const stats = {
    totalBooks: books.length,
    totalWords: books.reduce((sum, b) => sum + (b.stats?.total_words || 0), 0),
    totalAuthors: new Set(books.flatMap(b => b.authors.map(a => a.name))).size,
  }

  const getBookById = (id) => books.find(b => b.id === Number(id))

  const searchBooks = (query) => {
    const q = query.toLowerCase().trim()
    if (!q) return books
    return books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.authors.some(a => a.name.toLowerCase().includes(q))
    )
  }

  const getSubjects = () => {
    const subjects = {}
    books.forEach(b => {
      b.subjects?.forEach(s => {
        subjects[s] = (subjects[s] || 0) + 1
      })
    })
    return Object.entries(subjects)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }

  return (
    <BooksContext.Provider value={{ books, loading, error, stats, getBookById, searchBooks, getSubjects }}>
      {children}
    </BooksContext.Provider>
  )
}

export function useBooks() {
  const ctx = useContext(BooksContext)
  if (!ctx) throw new Error('useBooks must be used within BooksProvider')
  return ctx
}
