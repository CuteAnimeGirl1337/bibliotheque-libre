import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'bibliotheque-reading-progress'

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useReadingProgress(bookId) {
  const [progress, setProgress] = useState(() => {
    const all = getProgress()
    return all[bookId] || { chapterIndex: 0, scrollPercent: 0 }
  })

  const saveProgress = useCallback((chapterIndex, scrollPercent = 0) => {
    const all = getProgress()
    all[bookId] = { chapterIndex, scrollPercent, lastRead: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    setProgress(all[bookId])
  }, [bookId])

  return { progress, saveProgress }
}

export function useReaderPreferences() {
  const [fontSize, setFontSize] = useState(() =>
    localStorage.getItem('reader-font-size') || 'medium'
  )
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('reader-theme') || 'light'
  )

  useEffect(() => {
    localStorage.setItem('reader-font-size', fontSize)
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('reader-theme', theme)
    document.body.className = theme === 'light' ? '' : `theme-${theme}`
    return () => { document.body.className = '' }
  }, [theme])

  return { fontSize, setFontSize, theme, setTheme }
}
