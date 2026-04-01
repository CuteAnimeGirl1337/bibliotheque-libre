import { useState, useEffect, useRef } from 'react'

export function useScrollDirection() {
  const [direction, setDirection] = useState('up')
  const [scrollY, setScrollY] = useState(0)
  const lastY = useRef(0)

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY
      setScrollY(y)
      if (Math.abs(y - lastY.current) > 5) {
        setDirection(y > lastY.current ? 'down' : 'up')
        lastY.current = y
      }
    }
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return { direction, scrollY }
}
