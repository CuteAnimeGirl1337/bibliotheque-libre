import { useState, useEffect } from 'react'
import { useBooks } from '../context/BooksContext'

const BASE = import.meta.env.BASE_URL

// Cache manifest so we only fetch it once
let manifestCache = null

async function getManifest() {
  if (manifestCache) return manifestCache
  const res = await fetch(`${BASE}data/manifest.json`)
  if (!res.ok) throw new Error('Failed to load manifest')
  manifestCache = await res.json()
  return manifestCache
}

async function loadBook(bookId) {
  const manifest = await getManifest()
  const filename = manifest.find(f => f.startsWith(`${bookId}_`))
  if (!filename) throw new Error('Book file not found')
  const res = await fetch(`${BASE}data/${filename}`)
  if (!res.ok) throw new Error('Failed to load book')
  return res.json()
}

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

    loadBook(Number(bookId))
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
