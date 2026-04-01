import { useState, useCallback } from 'react'

const KEY = 'bibliotheque-bookmarks'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(load)

  const toggleBookmark = useCallback((id) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isBookmarked = useCallback((id) => bookmarks.includes(id), [bookmarks])

  return { bookmarks, toggleBookmark, isBookmarked }
}
