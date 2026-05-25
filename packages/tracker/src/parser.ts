import {DOMParser, HTMLDocument} from '@b-fuze/deno-dom'

export interface BaseParserOptions {
  fetch?: typeof fetch
  headers?: HeadersInit
}

export class BaseParser<T = {}> {
  protected readonly options: BaseParserOptions & T

  constructor(options: BaseParserOptions & T) {
    this.options = options
  }

  protected fetch(input: string | URL | Request, init?: RequestInit & BaseParserOptions): Promise<Response> {
    const _fetch = init?.fetch ?? this.options?.fetch ?? globalThis.fetch

    const mergedHeaders = new Headers({
      ...this.options?.headers,
      ...init?.headers,
    })

    const requestInit: RequestInit = {
      ...init,
      headers: mergedHeaders,
    }

    const request = new Request(input, requestInit)
    return _fetch(request)
  }

  protected async DOMParse(res: Response): Promise<HTMLDocument> {
    const charsetMatch = res.headers.get('Content-Type')?.match(/charset=([^;]+)/i)
    const charset = charsetMatch ? charsetMatch[1]?.trim().toLowerCase() : 'utf-8'

    if (charset !== 'utf-8') { // non UTF-8
      try {
        const decoder = new TextDecoder(charset)
        const html = decoder.decode(await res.bytes())

        return new DOMParser().parseFromString(html, 'text/html')
      } catch (e) {
        console.error(e, res.headers.get('Content-Type'))
      }
    }

    return new DOMParser().parseFromString(await res.text(), 'text/html')
  }

  protected parseContentDisposition(res: Response): string | null {
    const contentDisposition = res.headers.get('content-disposition')
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
}
