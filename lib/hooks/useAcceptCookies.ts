import Cookies from 'js-cookie'
import { useState } from 'react'

const COOKIE_NAME = 'accept_cookies'

export function useAcceptCookies() {
  const [acceptedCookies, setAcceptedCookies] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!Cookies.get(COOKIE_NAME)
    }
    return false
  })

  const acceptCookies = () => {
    setAcceptedCookies(true)
    Cookies.set(COOKIE_NAME, 'accepted', { expires: 365 })
  }

  return {
    acceptedCookies,
    onAcceptCookies: acceptCookies,
  }
}
