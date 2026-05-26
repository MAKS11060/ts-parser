import {MagnetURL} from './magnet.ts'
import {BaseParser, type BaseParserOptions} from './parser.ts'

export const hosts = [
  'https://rutracker.org',
  'https://rutracker.net',
]
export const trackers = [
  'http://retracker.local/announce',
  'http://bt.t-ru.org/ann',
  'http://bt2.t-ru.org/ann',
  'http://bt3.t-ru.org/ann',
  'http://bt4.t-ru.org/ann',
]

export const Status = {
  Approved: 'проверено',
  NotApproved: 'не проверено',
  NeedEdit: 'недооформлено',
  Dubiously: 'сомнительно',
  Temporary: 'временная',
  Consumed: 'поглощено',
} as const

export class RuTracker extends BaseParser<{session: string}> {
  constructor(options: BaseParserOptions & {session: string}) {
    super(options)

    this.options.headers = {'cookie': `bb_session=${this.options.session}`}
  }

  async search(
    options?: BaseParserOptions & {
      query?: string
      category?: number
      page?: number
    },
  ) {
    const body = new URLSearchParams()
    options?.query && body.set('nm', options.query)
    options?.category && body.set('f', String(options.category))
    options?.page && body.set('start', String(options.page * 50))

    try {
      for (const host of hosts) {
        const res = await this.fetch(`${host}/forum/tracker.php`, {
          ...options,
          method: 'POST',
          body,
          signal: AbortSignal.timeout(5000),
        })

        const doc = await this.DOMParse(res)

        return {
          get response() {
            return res
          },
          data: this.#parseSearch(doc),
        }
      }
    } catch (e) {
      console.error(e)
    }

    throw new Error('Hosts unavailable')
  }

  #parseSearch(doc: HTMLDocument) {
    return Array.from(doc.querySelectorAll('#tor-tbl tbody tr'), (row) => {
      if (row.children.length < 10) return null

      const topicId = parseInt(row.children[0]?.getAttribute('id') || '', 10) ?? null
      if (!topicId) return null // empty page

      const statusRU = row.children[1]?.getAttribute('title')!
      const status = ({
        'проверено': 'Approved',
        'не проверено': 'NotApproved',
        'недооформлено': 'NeedEdit',
        'сомнительно': 'Dubiously',
        'временная': 'Temporary',
        'поглощено': 'Consumed',
      } as const)[statusRU as typeof Status[keyof typeof Status]]

      const categoryLink = row.children[2]?.querySelector('.f-name a')
      const categoryHref = categoryLink?.getAttribute('href')
      const categoryUrl = new URL(`${hosts[0]}/forum/${categoryHref}`)
      const categoryId = parseInt(categoryUrl.searchParams.get('f')!, 10)
      const categoryName = categoryLink?.textContent.trim()!

      const titleEl = row.children[3]?.querySelector('div a')
      const titleHref = titleEl?.getAttribute('href')!
      const titleUrl = new URL(`${hosts[0]}/forum/${titleHref}`)

      const authorLink = row.children[4]?.querySelector('div a')
      const authorHref = authorLink?.getAttribute('href') ?? null
      const authorUrl = new URL(`${hosts[0]}/forum/${authorHref}`)
      const authorId = parseInt(authorUrl.searchParams.get('pid')!, 10)
      const authorName = authorLink?.textContent || ''

      const size = parseInt(row.children[5]?.getAttribute('data-ts_text') || '', 10) || 0
      const seeds = parseInt(row.children[6]?.querySelector('b')?.innerHTML || '', 10) || 0
      const leeches = parseInt(row.children[7]?.textContent || '', 10) || 0
      const downloads = parseInt(row.children[8]?.innerHTML || '', 10) || 0

      const createdAt = new Date(Number(row.children[9]?.getAttribute('data-ts_text')) * 1000)

      return {
        /** Page ID */
        id: topicId,
        href: titleUrl.href,
        title: titleEl?.textContent.trim()!,
        status,
        statusRU: statusRU,
        category: {
          id: categoryId,
          name: categoryName,
          href: categoryUrl.href,
        },
        author: {
          id: authorId,
          name: authorName,
          href: authorUrl.href,
        },
        size,
        seeds,
        leeches,
        downloads,
        createdAt,
      }!
    }).filter((v) => !!v)
  }

  async view(options: BaseParserOptions & {id: number}) {
    const topicId = typeof options === 'object' ? options.id : +options
    const url = new URL(`/forum/viewtopic.php`, hosts[0])
    url.searchParams.set('t', String(topicId))

    const res = await this.fetch(url, {...options})

    const doc = await this.DOMParse(res)

    const size = parseInt(doc.querySelector('#tor-size-humn')?.getAttribute('title') || '', 10) || null
    const magnetHref = doc.querySelector('.magnet-link')?.getAttribute('href') || null

    return {
      get response() {
        return res
      },
      id: topicId,
      size,
      magnet: magnetHref ? new MagnetURL(magnetHref) : null,
    }
  }

  async download(options: BaseParserOptions & {id: number}) {
    const topicId = typeof options === 'object' ? options.id : +options
    const url = new URL(`/forum/dl.php`, hosts[0])
    url.searchParams.set('t', String(topicId))

    const res = await this.fetch(url, {...options})

    const filename = this.parseContentDisposition(res) || `${topicId}.torrent`

    return {
      get response() {
        return res
      },
      filename,
      async getFile() {
        return new File(
          [await res.blob()],
          filename,
          {type: 'application/x-bittorrent'},
        )
      },
    }
  }
}
