import { useEffect, useRef } from 'react'

export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  active: boolean = true,
) {
  const elementRef = useRef<T>(null)
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!active) return

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = elementRef.current

      if (!el || el.contains(event.target as Node)) {
        return
      }

      handlerRef.current()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [active])

  return elementRef
}
