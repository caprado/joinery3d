import type { JSX } from 'preact'

export type LibrarySearchProps = {
  readonly searchQuery: string
  readonly onSearchChanged: (query: string) => void
}

export const LibrarySearch = (props: LibrarySearchProps): JSX.Element => {
  return (
    <div class="library-search">
      <input
        type="text"
        class="library-search-input"
        placeholder="Search parts..."
        value={props.searchQuery}
        onInput={(event) => {
          const target = event.currentTarget
          props.onSearchChanged(target.value)
        }}
      />
    </div>
  )
}
