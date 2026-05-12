export const loadImageToCanvas = (
  canvas: HTMLCanvasElement,
  imageData: Uint8Array,
): void => {
  const context = canvas.getContext('2d')
  if (context === null) return

  const buffer = new ArrayBuffer(imageData.byteLength)
  new Uint8Array(buffer).set(imageData)
  const blob = new Blob([buffer], { type: 'image/png' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.addEventListener('load', () => {
    context.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
  })
  img.src = url
}

export const fillCanvasWhite = (
  canvas: HTMLCanvasElement,
): void => {
  const context = canvas.getContext('2d')
  if (context === null) return
  context.fillStyle = 'rgba(255, 255, 255, 1)'
  context.fillRect(0, 0, canvas.width, canvas.height)
}
