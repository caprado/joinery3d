import { useState } from 'preact/hooks'
import type { Part } from '../../schema/part'
import { searchPartsByName } from '../../core/library-index'
import type { LibraryIndex } from '../../schema/library'

export type FilteredPartsState = {
  readonly searchQuery: string
  readonly filteredParts: readonly Part[]
  readonly setSearchQuery: (query: string) => void
}

export const useFilteredParts = (
  availableParts: readonly Part[],
  library: LibraryIndex,
): FilteredPartsState => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredParts =
    searchQuery.length === 0
      ? availableParts
      : searchPartsByName(library, searchQuery).filter((part) =>
          availableParts.some((available) => available.id.value === part.id.value),
        )

  return { searchQuery, filteredParts, setSearchQuery }
}
