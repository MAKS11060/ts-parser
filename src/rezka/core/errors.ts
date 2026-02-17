export class RezkaError extends Error {
  override name = this.constructor.name
  readonly context
  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.context = context
  }
}

export class RezkaFetchError extends RezkaError {
  readonly response: Response
  constructor(response: Response) {
    super(`HTTP ${response.status}: ${response.statusText}`, {url: response.url})
    this.response = response
  }
}

export class RezkaParseError extends RezkaError {
  constructor(message: string, htmlSnippet?: string) {
    super(message, {snippet: htmlSnippet?.slice(0, 100)})
  }
}

export class RezkaValidationError extends RezkaError {}
