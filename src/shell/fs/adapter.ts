export type FsAdapter = {
  readonly pickFolder: () => Promise<string | undefined>
  readonly pickFile: (extensions: readonly string[]) => Promise<string | undefined>
  readonly readTextFile: (path: string) => Promise<string>
  readonly writeTextFile: (path: string, content: string) => Promise<void>
  readonly readBinaryFile: (path: string) => Promise<Uint8Array>
  readonly writeBinaryFile: (path: string, content: Uint8Array) => Promise<void>
  readonly listFiles: (path: string) => Promise<readonly string[]>
  readonly watchFolder: (path: string, onChange: () => void) => () => void
}
