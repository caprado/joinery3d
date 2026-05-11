import type { JSX } from 'preact'
import type { Part } from '../../schema/part'
import type { LibraryIndex } from '../../schema/library'
import { LibraryPartItem } from './library-part-item'
import { LibrarySearch } from './library-search'
import { useFilteredParts } from './use-filtered-parts'

export type LibraryPanelProps = {
  readonly availableParts: readonly Part[]
  readonly library: LibraryIndex
  readonly onPartSelected: (partId: string) => void
}

export const LibraryPanel = (props: LibraryPanelProps): JSX.Element => {
  const { searchQuery, filteredParts, setSearchQuery } = useFilteredParts(
    props.availableParts,
    props.library,
  )

  return (
    <aside class="library-panel">
      <LibrarySearch searchQuery={searchQuery} onSearchChanged={setSearchQuery} />
      <ul class="library-panel-list">
        {filteredParts.map((part) => (
          <LibraryPartItem
            key={part.id.value}
            partId={part.id.value}
            partName={part.name}
            thumbnailFile={part.thumbnailFile}
            onSelect={() => {
              props.onPartSelected(part.id.value)
            }}
          />
        ))}
      </ul>
      {filteredParts.length === 0 && (
        <p class="library-panel-empty">No parts available</p>
      )}
    </aside>
  )
}
