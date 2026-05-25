export class MagnetURL {
  #url: URL

  constructor(input: string, options?: {
    displayName?: string
    trackers?: string[]
  }) {
    this.#url = new URL(
      input.startsWith('magnet:')
        ? input
        : `magnet:?xt=urn:btih:${input}`,
    )

    if (options?.displayName) {
      this.displayName(options.displayName)
    }
    for (const tracker of options?.trackers ?? []) {
      this.addTracker(tracker)
    }
  }

  get hash(): string | null {
    const xt = this.#url.searchParams.get('xt')
    return xt ? xt.replace('urn:btih:', '') : null
  }

  /** Возвращает имя раздачи */
  get name(): string | null {
    return this.#url.searchParams.get('dn')
  }

  /** Возвращает размер файла в байтах */
  get size(): number | null {
    const xl = this.#url.searchParams.get('xl')
    return xl ? parseInt(xl, 10) : null
  }

  /** Возвращает список всех добавленных трекеров */
  get trackers(): string[] {
    return this.#url.searchParams.getAll('tr')
  }

  /** Возвращает список всех веб-сидов (as и ws) */
  get webSeeds(): string[] {
    return [
      ...this.#url.searchParams.getAll('as'),
      ...this.#url.searchParams.getAll('ws'),
    ]
  }

  /** Возвращает список ключевых слов */
  get keywords(): string[] {
    return this.#url.searchParams.getAll('kt')
  }

  /** Возвращает список прямых пиров */
  get peers(): string[] {
    return this.#url.searchParams.getAll('x.pe')
  }

  addTracker(tracker: string): this {
    this.#url.searchParams.append('tr', tracker)
    return this
  }

  displayName(name: string): this {
    this.#url.searchParams.set('dn', name)
    return this
  }

  exactLength(bytes: number | bigint): this {
    this.#url.searchParams.set('xl', bytes.toString())
    return this
  }

  addWebSeed(url: string): this {
    this.#url.searchParams.append('as', url)
    return this
  }

  addWebSeedDirect(url: string): this {
    this.#url.searchParams.append('ws', url)
    return this
  }

  addKeyword(keyword: string): this {
    this.#url.searchParams.append('kt', keyword)
    return this
  }

  manifestTopic(url: string): this {
    this.#url.searchParams.set('mt', url)
    return this
  }

  addPeer(peer: string): this {
    this.#url.searchParams.append('x.pe', peer)
    return this
  }

  toString(): string {
    return decodeURIComponent(this.#url.toString())
  }

  toJSON(): string {
    return this.toString()
  }

  get [Symbol.toStringTag]() {
    return `magnet:?xt=urn:btih:${this.hash}`
  }
}
