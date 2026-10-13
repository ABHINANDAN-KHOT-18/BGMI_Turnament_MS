
export interface ExportOptions {
  fileName?: string
  pixelRatio?: number
}

export async function exportElementAsPng(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<string> {
  const { fileName = 'bgmi-tournament-card.png', pixelRatio = 2 } = options

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    const { toPng } = await import('html-to-image')

    const dataUrl = await toPng(element, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: '#000000',
    })

    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    link.click()

    return dataUrl
  } catch (error) {
    console.error('Failed to export element as PNG:', error)
    throw new Error(
      'Image generation failed. Please ensure fonts and assets are accessible.'
    )
  }
}

export async function sharePngOrLink(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return true
    } catch {
      return false
    }
  }

  return false
}