import * as React from "react"

const MOBILE_BREAKPOINT = 768

function getMobileSnapshot() {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener("change", onStoreChange)

      return () => mql.removeEventListener("change", onStoreChange)
    },
    getMobileSnapshot,
    () => false,
  )
}
