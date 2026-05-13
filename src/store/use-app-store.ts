import { useRef, useCallback } from 'preact/hooks'
import { useSyncExternalStore } from 'preact/compat'
import type { StoreApi } from 'zustand/vanilla'
import type { Store } from './store'

export const useAppStore = <T>(
  store: StoreApi<Store>,
  selector: (state: Store) => T,
): T => {
  const selectorRef = useRef(selector)
  selectorRef.current = selector

  const previousRef = useRef<T | undefined>(undefined)

  const getSnapshot = useCallback((): T => {
    const next = selectorRef.current(store.getState())
    if (previousRef.current !== undefined && shallowEqual(previousRef.current, next)) {
      return previousRef.current
    }
    previousRef.current = next
    return next
  }, [store])

  return useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    getSnapshot,
  )
}

const shallowEqual = <T>(left: T, right: T): boolean => {
  if (Object.is(left, right)) return true
  if (typeof left !== 'object' || typeof right !== 'object') return false
  if (left === null || right === null) return false
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false
    return left.every((item, index) => Object.is(item, right[index]))
  }
  return false
}
