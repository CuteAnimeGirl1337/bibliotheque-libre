import { useState, useEffect } from 'react'
import { useBooks } from '../context/BooksContext'

export function useBook(bookId) {
  const { getBookById } = useBooks()
  const [bookData, setBookData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const catalogEntry = getBookById(bookId)

  useEffect(() => {
    if (!bookId) return
    setLoading(true)
    setError(null)

    fetch('/data/books_db.json')
      .then(res => res.json())
      .then(catalog => {
        const entry = catalog.find(b => b.id === Number(bookId))
        if (!entry) throw new Error('Book not found in catalog')

        // Find the matching JSON file — try to fetch by id prefix
        return fetch(`/data/books_db.json`)
          .then(() => entry)
      })
      .then(entry => {
        // We need to find the actual file. The files are named like "17989_Title.json"
        // We'll try to load using the catalog to find the filename
        return findAndLoadBook(Number(bookId))
      })
      .then(data => {
        setBookData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [bookId])

  return { book: bookData, catalogEntry, loading, error }
}

async function findAndLoadBook(bookId) {
  // Load the file list from catalog, then try to fetch the book file
  // Files are named like "13846_Discours_de_la_méthode.json"
  // We fetch the catalog to get the title, then construct the filename
  const catalogRes = await fetch('/data/books_db.json')
  const catalog = await catalogRes.json()
  const entry = catalog.find(b => b.id === bookId)
  if (!entry) throw new Error('Book not found')

  // Try fetching with the book ID prefix pattern
  // Since we can't list directory contents, we'll use a manifest approach
  // First try: fetch /data/manifest.json which we'll generate
  try {
    const manifestRes = await fetch('/data/manifest.json')
    if (manifestRes.ok) {
      const manifest = await manifestRes.json()
      const filename = manifest.find(f => f.startsWith(`${bookId}_`))
      if (filename) {
        const res = await fetch(`/data/${filename}`)
        if (res.ok) return res.json()
      }
    }
  } catch (e) {
    // manifest not available, continue
  }

  throw new Error('Book file not found')
}
