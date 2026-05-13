import type { JSX } from 'preact'
import type { StoreApi } from 'zustand/vanilla'
import type { Store } from '../../store/store'
import { useAppStore } from '../../store/use-app-store'

export type ViewOptionsBarProps = {
  readonly store: StoreApi<Store>
  readonly onResetCamera: () => void
}

export const ViewOptionsBar = (props: ViewOptionsBarProps): JSX.Element => {
  const viewOptions = useAppStore(props.store, (state) => state.viewOptions)

  const bgColor = viewOptions.background.kind === 'solid'
    ? viewOptions.background.color
    : '#1a1a1a'

  return (
    <div class="view-options-bar">
      <label class="view-option">
        <input
          type="checkbox"
          checked={viewOptions.showGrid}
          onChange={() => {
            props.store.getState().toggleViewOption('showGrid')
          }}
        />
        Grid
      </label>
      <label class="view-option">
        <input
          type="checkbox"
          checked={viewOptions.wireframe}
          onChange={() => {
            props.store.getState().toggleViewOption('wireframe')
          }}
        />
        Wireframe
      </label>
      <label class="view-option">
        <input
          type="checkbox"
          checked={viewOptions.ps1Effects}
          onChange={() => {
            props.store.getState().toggleViewOption('ps1Effects')
          }}
        />
        PS1
      </label>
      <label class="view-option">
        Light
        <input
          type="range"
          class="view-option-slider"
          min="0.3"
          max="4.0"
          step="0.1"
          value={viewOptions.brightness}
          onInput={(event) => {
            const target = event.currentTarget
            if (target instanceof HTMLInputElement) {
              props.store.getState().setViewOptions({
                brightness: parseFloat(target.value),
              })
            }
          }}
        />
      </label>
      <label class="view-option">
        BG
        <input
          type="color"
          class="view-option-color"
          value={bgColor}
          onInput={(event) => {
            const target = event.currentTarget
            if (target instanceof HTMLInputElement) {
              props.store.getState().setViewOptions({
                background: { kind: 'solid', color: target.value },
              })
            }
          }}
        />
      </label>
      <button
        type="button"
        class="view-option-button"
        onClick={props.onResetCamera}
      >
        Re-center
      </button>
    </div>
  )
}
