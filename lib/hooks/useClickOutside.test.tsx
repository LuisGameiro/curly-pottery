import { renderHook } from '@testing-library/react'
import { useClickOutside } from './useClickOutside'

describe('useClickOutside', () => {
  let addEventListenerSpy: jest.SpyInstance
  let removeEventListenerSpy: jest.SpyInstance

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a ref object', () => {
    const handler = jest.fn()
    const { result } = renderHook(() => useClickOutside(handler))

    expect(result.current).toHaveProperty('current')
  })

  it('should attach mousedown and touchstart listeners when active is true', () => {
    const handler = jest.fn()
    renderHook(() => useClickOutside(handler, true))

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
    )
  })

  it('should not attach listeners when active is false', () => {
    const handler = jest.fn()
    renderHook(() => useClickOutside(handler, false))

    expect(addEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should remove listeners on cleanup', () => {
    const handler = jest.fn()
    const { unmount } = renderHook(() => useClickOutside(handler, true))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
    )
  })

  it('should call handler when clicking outside element', () => {
    const handler = jest.fn()
    const { result } = renderHook(() =>
      useClickOutside<HTMLDivElement>(handler),
    )

    const div = document.createElement('div')
    if (result.current) {
      ;(result.current as React.RefObject<HTMLDivElement>).current = div
    }
    document.body.appendChild(div)

    const event = new MouseEvent('mousedown', { bubbles: true })
    document.body.dispatchEvent(event)

    expect(handler).toHaveBeenCalled()

    document.body.removeChild(div)
  })

  it('should not call handler when clicking inside element', () => {
    const handler = jest.fn()
    const { result } = renderHook(() =>
      useClickOutside<HTMLDivElement>(handler),
    )

    const div = document.createElement('div')
    const child = document.createElement('span')
    div.appendChild(child)
    Object.defineProperty(result.current, 'current', { value: div })

    const event = new MouseEvent('mousedown')
    Object.defineProperty(event, 'target', { value: child, enumerable: true })

    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })
})
