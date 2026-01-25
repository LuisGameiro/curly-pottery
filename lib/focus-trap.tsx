// import { useEffect, RefObject, createElement, ReactNode, useRef } from 'react'
// import { tabbable } from 'tabbable'

// interface Props {
//   children: ReactNode
//   focusFirst?: boolean
// }

// export default function FocusTrap({ children, focusFirst = false }: Props) {
//   const root: RefObject<any> = useRef(null)
//   const anchor: RefObject<any> = useRef(document.activeElement)

//   const returnFocus = () => {
//     if (anchor) {
//       anchor.current.focus()
//     }
//   }

//   const trapFocus = () => {
//     if (root.current) {
//       root.current.focus()
//       if (focusFirst) {
//         selectFirstFocusableEl()
//       }
//     }
//   }

//   const selectFirstFocusableEl = () => {
//     // Try to find focusable elements, if match then focus
//     // Up to 6 seconds of load time threshold
//     let match = false
//     const end = 60 // Try to find match at least n times
//     let i = 0
//     const timer = setInterval(() => {
//       if (!match !== i > end) {
//         match = !!tabbable(root.current).length
//         if (match) {
//           // Attempt to focus the first el
//           tabbable(root.current)[0].focus()
//         }
//         i = i + 1
//       } else {
//         // Clear interval after n attempts
//         clearInterval(timer)
//       }
//     }, 100)
//   }

//   useEffect(() => {
//     setTimeout(trapFocus, 20)
//     return () => {
//       returnFocus()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [root, children])

//   return createElement(
//     'div',
//     {
//       ref: root,
//       className: 'outline-hidden focus-trap',
//       tabIndex: -1,
//     },
//     children,
//   )
// }
