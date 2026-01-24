import Cookies from 'js-cookie'
import { useState } from 'react'

const COOKIE_NAME = 'accept_cookies'

export const useAcceptCookies = () => {
  const [acceptedCookies, setAcceptedCookies] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!Cookies.get(COOKIE_NAME)
    }
    return false
  })

  // useState(true);

  // useLayoutEffect(() => {
  //   if (!Cookies.get(COOKIE_NAME)) {
  //     setAcceptedCookies(false);
  //   }
  // }, []);

  const acceptCookies = () => {
    setAcceptedCookies(true)
    Cookies.set(COOKIE_NAME, 'accepted', { expires: 365 })
  }

  return {
    acceptedCookies,
    onAcceptCookies: acceptCookies,
  }
}
