import { createContext, useContext } from 'react'
import { useBookmarks } from '../hooks/useBookmarks'

const BookmarksContext = createContext(null)

export function BookmarksProvider({ children }) {
  const bookmarks = useBookmarks()
  return (
    <BookmarksContext.Provider value={bookmarks}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarksContext() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarksContext must be used within BookmarksProvider')
  return ctx
}
