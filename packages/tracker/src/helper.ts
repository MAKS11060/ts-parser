export function parseFilename(contentDisposition?: string | null): string | null {
  if (!contentDisposition) return null

  // 1. check filename*=UTF-8''...
  const utf8Match = contentDisposition.match(/filename\*=\s*UTF-8''([^;\s]+)/i)
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {}
  }

  // 2. check filename="..."
  const classicMatch = contentDisposition.match(/filename\s*=\s*["']?([^"';\s]+)["']?/i)
  if (classicMatch && classicMatch[1]) {
    try {
      return decodeURIComponent(classicMatch[1])
    } catch {
      return classicMatch[1]
    }
  }

  return null
}
