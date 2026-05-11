export type ValidationError = {
  readonly path: string
  readonly message: string
  readonly received: unknown
}
