export type QuantizedImage = {
  readonly palette: readonly PaletteEntry[]
  readonly indices: readonly number[]
  readonly width: number
  readonly height: number
}

export type PaletteEntry = {
  readonly red: number
  readonly green: number
  readonly blue: number
}

export type QuantizeArgs = {
  readonly pixels: readonly number[]
  readonly width: number
  readonly height: number
  readonly maxColors: number
}

export const quantizeImage = (args: QuantizeArgs): QuantizedImage => {
  const pixelColors = extractPixelColors(args.pixels)
  const palette = buildPalette(pixelColors, args.maxColors)
  const indices = pixelColors.map((color) => findClosestPaletteIndex(color, palette))

  return {
    palette,
    indices,
    width: args.width,
    height: args.height,
  }
}

const extractPixelColors = (pixels: readonly number[]): readonly PaletteEntry[] =>
  Array.from(
    { length: Math.floor(pixels.length / 4) },
    (_, index) => ({
      red: pixels[index * 4] ?? 0,
      green: pixels[index * 4 + 1] ?? 0,
      blue: pixels[index * 4 + 2] ?? 0,
    }),
  )

const buildPalette = (
  colors: readonly PaletteEntry[],
  maxColors: number,
): readonly PaletteEntry[] => {
  const uniqueMap = colors.reduce<ReadonlyMap<string, PaletteEntry>>(
    (acc, color) => {
      const key = `${String(color.red)},${String(color.green)},${String(color.blue)}`
      if (acc.has(key)) return acc
      return new Map([...acc, [key, color]])
    },
    new Map(),
  )

  const unique = Array.from(uniqueMap.values())
  if (unique.length <= maxColors) return unique

  return medianCutQuantize(unique, maxColors)
}

const medianCutQuantize = (
  colors: readonly PaletteEntry[],
  maxColors: number,
): readonly PaletteEntry[] => {
  const initialBuckets: readonly (readonly PaletteEntry[])[] = [colors]
  const finalBuckets = splitBucketsUntilDone(initialBuckets, maxColors)
  return finalBuckets.map((bucket) => averageColor(bucket))
}

const splitBucketsUntilDone = (
  buckets: readonly (readonly PaletteEntry[])[],
  maxColors: number,
): readonly (readonly PaletteEntry[])[] => {
  if (buckets.length >= maxColors) return buckets

  const largestIndex = findLargestBucketIndex(buckets)
  const bucket = buckets[largestIndex]
  if (bucket === undefined || bucket.length <= 1) return buckets

  const channel = findWidestChannel(bucket)
  const sorted = [...bucket].sort(
    (left, right) => getChannel(left, channel) - getChannel(right, channel),
  )

  const midpoint = Math.floor(sorted.length / 2)
  const lower = sorted.slice(0, midpoint)
  const upper = sorted.slice(midpoint)

  const newBuckets = [
    ...buckets.slice(0, largestIndex),
    lower,
    upper,
    ...buckets.slice(largestIndex + 1),
  ]

  return splitBucketsUntilDone(newBuckets, maxColors)
}

const findLargestBucketIndex = (
  buckets: readonly (readonly PaletteEntry[])[],
): number =>
  buckets.reduce<{ readonly index: number; readonly size: number }>(
    (best, bucket, index) =>
      bucket.length > best.size ? { index, size: bucket.length } : best,
    { index: 0, size: 0 },
  ).index

type ColorChannel = 'red' | 'green' | 'blue'

const getChannel = (color: PaletteEntry, channel: ColorChannel): number => color[channel]

const findWidestChannel = (colors: readonly PaletteEntry[]): ColorChannel => {
  const ranges: Record<ColorChannel, number> = {
    red: channelRange(colors, 'red'),
    green: channelRange(colors, 'green'),
    blue: channelRange(colors, 'blue'),
  }
  if (ranges.red >= ranges.green && ranges.red >= ranges.blue) return 'red'
  if (ranges.green >= ranges.blue) return 'green'
  return 'blue'
}

const channelRange = (colors: readonly PaletteEntry[], channel: ColorChannel): number => {
  const values = colors.map((color) => getChannel(color, channel))
  return Math.max(...values) - Math.min(...values)
}

const averageColor = (colors: readonly PaletteEntry[]): PaletteEntry => {
  if (colors.length === 0) return { red: 0, green: 0, blue: 0 }
  const total = colors.reduce(
    (acc, color) => ({
      red: acc.red + color.red,
      green: acc.green + color.green,
      blue: acc.blue + color.blue,
    }),
    { red: 0, green: 0, blue: 0 },
  )
  return {
    red: Math.round(total.red / colors.length),
    green: Math.round(total.green / colors.length),
    blue: Math.round(total.blue / colors.length),
  }
}

const findClosestPaletteIndex = (
  color: PaletteEntry,
  palette: readonly PaletteEntry[],
): number =>
  palette.reduce<{ readonly index: number; readonly distance: number }>(
    (best, entry, index) => {
      const distance =
        (color.red - entry.red) ** 2 +
        (color.green - entry.green) ** 2 +
        (color.blue - entry.blue) ** 2
      return distance < best.distance ? { index, distance } : best
    },
    { index: 0, distance: Infinity },
  ).index
