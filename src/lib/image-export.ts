import { toPng } from 'html-to-image'

export interface ExportOptions {
  fileName?: string
  pixelRatio?: number
}

/**
 * Ensures that fonts and assets are ready before capturing high-resolution PNGs
 */
export async function exportElementAsPng(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<string> {
  const { fileName = 'bgmi-tournament-card.png', pixelRatio = 2 } = options

  try {
    // 1. Await browser font loading
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }

    // 2. Render node to high-res PNG data URL
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio,
      cacheBust: true,
      backgroundColor: '#000000',
    })

    // 3. Trigger clean client-side download
    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    link.click()

    return dataUrl
  } catch (error) {
    console.error('Failed to export element as PNG:', error)
    throw new Error('Image generation failed. Please ensure fonts and assets are accessible.')
  }
}

/**
 * Checks native mobile/browser sharing support
 */
export async function sharePngOrLink(title: string, text: string, url: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return true
    } catch {
      // User cancelled or share dismissed
      return false
    }
  }
  return false
}
