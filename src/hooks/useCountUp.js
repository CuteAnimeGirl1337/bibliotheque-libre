import { useState, useEffect, useRef } from 'react'
import { useInView } from './useInView'

export function useCountUp(target, duration = 1500) {
  const { ref, inView } = useInView()
  const [value, setValue] = useState(0)
  const animatedTo = useRef(0)

  useEffect(() => {
    if (!inView || target <= 0 || target === animatedTo.current) return
    animatedTo.current = target
    const start = performance.now()
    const from = 0
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4)
      setValue(Math.round(from + eased * (target - from)))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return { ref, value }
}
