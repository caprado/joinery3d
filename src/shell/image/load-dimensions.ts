export const loadImageDimensions = (
  data: Uint8Array,
  onLoaded: (width: number, height: number) => void,
): void => {
  const buffer = new ArrayBuffer(data.byteLength)
  new Uint8Array(buffer).set(data)
  const blob = new Blob([buffer], { type: 'image/png' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.addEventListener('load', () => {
    onLoaded(img.naturalWidth, img.naturalHeight)
    URL.revokeObjectURL(url)
  })
  img.src = url
}
