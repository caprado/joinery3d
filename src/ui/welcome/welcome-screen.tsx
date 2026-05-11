import type { JSX } from 'preact'
import { Button } from '../common/button'

export type WelcomeScreenProps = {
  readonly onOpenLibrary: () => void
  readonly onUseSampleLibrary: () => void
}

export const WelcomeScreen = (props: WelcomeScreenProps): JSX.Element => {
  return (
    <div class="welcome-screen">
      <div class="welcome-screen-content">
        <h1 class="welcome-screen-title">Joinery3D</h1>
        <p class="welcome-screen-subtitle">
          A modular 3D asset assembler for game prototyping
        </p>
        <div class="welcome-screen-actions">
          <Button
            label="Open Library Folder"
            onClick={props.onOpenLibrary}
            variant="primary"
          />
          <Button
            label="Use Sample Library"
            onClick={props.onUseSampleLibrary}
          />
        </div>
      </div>
    </div>
  )
}
