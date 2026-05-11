import { type Result, ok, err } from './result'

export const mapResult =
  <T, U>(fn: (value: T) => U) =>
  <E>(result: Result<T, E>): Result<U, E> =>
    result.ok ? ok(fn(result.value)) : result

export const flatMapResult =
  <T, U, E>(fn: (value: T) => Result<U, E>) =>
  (result: Result<T, E>): Result<U, E> =>
    result.ok ? fn(result.value) : result

export const mapErrResult =
  <E, F>(fn: (error: E) => F) =>
  <T>(result: Result<T, E>): Result<T, F> =>
    result.ok ? result : err(fn(result.error))

export const isOk = <T, E>(
  result: Result<T, E>,
): result is { readonly ok: true; readonly value: T } => result.ok

export const isErr = <T, E>(
  result: Result<T, E>,
): result is { readonly ok: false; readonly error: E } => !result.ok

export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) return result.value
  throw new Error(`Called unwrap on an Err: ${String(result.error)}`)
}

export const unwrapOr =
  <T>(fallback: T) =>
  <E>(result: Result<T, E>): T =>
    result.ok ? result.value : fallback
