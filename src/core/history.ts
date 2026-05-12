export type HistoryEntry<TSnapshot> = {
  readonly label: string
  readonly previousState: TSnapshot
}

export type HistoryState<TSnapshot> = {
  readonly past: readonly HistoryEntry<TSnapshot>[]
  readonly future: readonly HistoryEntry<TSnapshot>[]
  readonly limit: number
}

export const emptyHistory = <TSnapshot>(limit: number): HistoryState<TSnapshot> => ({
  past: [],
  future: [],
  limit,
})

export const pushHistory = <TSnapshot>(
  history: HistoryState<TSnapshot>,
  label: string,
  snapshot: TSnapshot,
): HistoryState<TSnapshot> => {
  const entry: HistoryEntry<TSnapshot> = { label, previousState: snapshot }

  const newPast =
    history.past.length >= history.limit
      ? [...history.past.slice(1), entry]
      : [...history.past, entry]

  return { ...history, past: newPast, future: [] }
}

export const popUndo = <TSnapshot>(
  history: HistoryState<TSnapshot>,
  currentSnapshot: TSnapshot,
): { readonly history: HistoryState<TSnapshot>; readonly snapshot: TSnapshot } | undefined => {
  const lastEntry = history.past[history.past.length - 1]
  if (lastEntry === undefined) return undefined

  return {
    history: {
      ...history,
      past: history.past.slice(0, -1),
      future: [{ label: lastEntry.label, previousState: currentSnapshot }, ...history.future],
    },
    snapshot: lastEntry.previousState,
  }
}

export const popRedo = <TSnapshot>(
  history: HistoryState<TSnapshot>,
  currentSnapshot: TSnapshot,
): { readonly history: HistoryState<TSnapshot>; readonly snapshot: TSnapshot } | undefined => {
  const nextEntry = history.future[0]
  if (nextEntry === undefined) return undefined

  return {
    history: {
      ...history,
      future: history.future.slice(1),
      past: [...history.past, { label: nextEntry.label, previousState: currentSnapshot }],
    },
    snapshot: nextEntry.previousState,
  }
}
