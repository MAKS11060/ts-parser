/**
 * Magnet URL builder and parser.
 *
 * @example
 * ```ts
 * const magnet = new MagnetURL('0123456789abcdef0123456789abcdef01234567', {
 *   displayName: 'My File',
 *   trackers: ['udp://tracker.openbittorrent.com:80'],
 * })
 * magnet.addKeyword('example').addPeer('192.0.2.1:6881')
 * console.log(magnet.toString())
 * ```
 */
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

  /** Returns the torrent name */
  get name(): string | null {
    return this.#url.searchParams.get('dn')
  }

  /** Returns the file size in bytes */
  get size(): number | null {
    const xl = this.#url.searchParams.get('xl')
    return xl ? parseInt(xl, 10) : null
  }

  /** Returns the list of all added trackers */
  get trackers(): string[] {
    return this.#url.searchParams.getAll('tr').map(decodeURIComponent)
  }

  /** Returns the list of web seeds (as and ws) */
  get webSeeds(): string[] {
    return [
      ...this.#url.searchParams.getAll('as'),
      ...this.#url.searchParams.getAll('ws'),
    ]
  }

  /** Returns the list of keywords */
  get keywords(): string[] {
    return this.#url.searchParams.getAll('kt')
  }

  /** Returns the list of direct peers */
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
    return this.#url.toString()
    // return decodeURIComponent(this.#url.toString())
  }

  toJSON(): string {
    return this.toString()
  }

  get [Symbol.toStringTag]() {
    return `magnet:?xt=urn:btih:${this.hash}`
  }
}
