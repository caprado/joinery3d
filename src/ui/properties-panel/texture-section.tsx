import type { JSX } from 'preact'
import type { TextureChannel } from '../../schema/part'

export type TextureAssignment = {
  readonly channel: TextureChannel
  readonly textureId: string | undefined
  readonly textureName: string | undefined
}

export type TextureSectionProps = {
  readonly assignments: readonly TextureAssignment[]
}

export const TextureSection = (props: TextureSectionProps): JSX.Element => {
  if (props.assignments.length === 0) return <div class="texture-section" />

  return (
    <div class="texture-section">
      <h4 class="texture-section-title">Textures</h4>
      <ul class="texture-section-list">
        {props.assignments.map((assignment) => (
          <li key={assignment.channel} class="texture-section-item">
            <span class="texture-section-channel">{assignment.channel}</span>
            <span class="texture-section-name">
              {assignment.textureName ?? 'None'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
