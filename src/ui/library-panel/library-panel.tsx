import type { JSX } from 'preact'
import { useRef } from 'preact/hooks'
import type { Part } from '../../schema/part'
import type { LibraryIndex } from '../../schema/library'
import { LibraryPartItem } from './library-part-item'
import { LibrarySearch } from './library-search'
import { useFilteredParts } from './use-filtered-parts'
import { useGlbDrop } from './use-glb-drop'
import { ImportPartDialog } from './import-part-dialog'

export type LibraryPanelProps = {
  readonly availableParts: readonly Part[]
  readonly library: LibraryIndex
  readonly onPartSelected: (partId: string) => void
  readonly onImportPart?: (name: string, tags: readonly string[], data: Uint8Array) => void
}

export const LibraryPanel = (props: LibraryPanelProps): JSX.Element => {
  const containerRef = useRef<HTMLElement>(null)
  const { searchQuery, filteredParts, setSearchQuery } = useFilteredParts(
    props.availableParts,
    props.library,
  )
  const { isDragging, droppedFile, clearDroppedFile } = useGlbDrop(containerRef)

  const handleImportConfirm = (name: string, tags: readonly string[]): void => {
    if (droppedFile === undefined) return
    props.onImportPart?.(name, tags, droppedFile.data)
    clearDroppedFile()
  }

  return (
    <aside class={`library-panel ${isDragging ? 'library-panel--dragging' : ''}`} ref={containerRef}>
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
      {isDragging && (
        <div class="library-panel-drop-overlay">Drop GLB file here</div>
      )}
      <ImportPartDialog
        isOpen={droppedFile !== undefined}
        fileName={droppedFile?.name ?? ''}
        onConfirm={handleImportConfirm}
        onClose={clearDroppedFile}
      />
    </aside>
  )
}
