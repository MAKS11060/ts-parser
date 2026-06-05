import {MagnetURL} from './magnet.ts'
import {BaseParser, type BaseParserOptions} from './parser.ts'
import type {TorrentFileListContainer, TorrentFileListFlatten, TorrentFsFile, TorrentFsFolder} from './types.ts'

const baseUrl = 'https://nyaa.si'
const hosts = [
  'https://nyaa.si',
  'https://nyaa.land',
]

function parseFileSizeToBytes(str: string) {
  const match = str.match(/\(?([\d.]+)\s*([a-zA-Z]+)\)?/)
  if (!match) return null

  const value = Math.round(parseFloat(match[1] || ''))
  const unit = match[2]

  const multipliers = {
    'bytes': 1,
    'kib': 1024 ** 1,
    'mib': 1024 ** 2,
    'gib': 1024 ** 3,
    'tib': 1024 ** 4,
  }

  const unitKey = unit?.toLowerCase()!
  if (unitKey in multipliers) {
    return value * multipliers[unitKey as keyof typeof multipliers]
  }

  return null
}

// Parse File List

function parseFileList(document: HTMLDocument) {
  const heading = Array.from(document.querySelectorAll('.panel-heading'))
    .find((el) => el.textContent.trim().toLowerCase() === 'file list')

  if (!heading) {
    return null
  }

  const panelBody = heading.closest('.panel')?.querySelector('.torrent-file-list.panel-body')
  if (!panelBody) return null

  const rootUl = panelBody.querySelector('ul')
  return rootUl ? parseFileListNode(rootUl) : []
}

function parseFileListNode(ul: HTMLUListElement): TorrentFileListContainer {
  const liElements = ul.querySelectorAll(':scope > li')

  return Array.from(liElements, (li) => {
    const folderLink = li.querySelector(':scope > a.folder')
    const subUl = li.querySelector<HTMLUListElement>(':scope > ul')

    if (folderLink && subUl) {
      return ({
        type: 'folder',
        name: folderLink.textContent.trim(),
        children: parseFileListNode(subUl),
      } as TorrentFsFolder)
    } else {
      const sizeSpan = li.querySelector('.file-size')
      const size = sizeSpan ? sizeSpan.textContent.trim() : ''

      const name = li.textContent.replace(size, '').trim()

      return ({
        type: 'file',
        name: name,
        size: parseFileSizeToBytes(size),
      } as TorrentFsFile)
    }
  })
}

function flattenFileList(nodes: TorrentFileListContainer, path = ''): TorrentFileListFlatten {
  return Array.from(nodes, (node) => {
    const currentPath = path ? `${path}/${node.name}` : node.name
    if (node.type === 'folder') {
      return flattenFileList(node.children, currentPath)
    } else {
      return {
        path: currentPath,
        name: node.name,
        size: node.size,
      } as const
    }
  }).flat()
}

// search query params
const category = {
  all: {
    _: 0,
  },
  anime: {
    _: 1,
    'amv': 1,
    'anime-music-video': 1,
    'english-translated': 2,
    'non-english-translated': 3,
    'raw': 4,
  },
  audio: {
    _: 2,
    'lossless': 1,
    'lossy': 2,
  },
  literature: {
    _: 3,
    'english-translated': 1,
    'non-english-translated': 2,
    'raw': 3,
  },
  'live-action': {
    _: 4,
    'english-translated': 1,
    'idol-promotional-video': 2,
    'non-english-translated': 3,
    'raw': 4,
  },
  pictures: {
    _: 5,
    'graphics': 1,
    'photos': 2,
  },
  software: {
    _: 6,
    'applications': 1,
    'games': 2,
  },
} as const

const filter = {
  'no filter': 0,
  'trusted only': 1,
  'no remakes': 2,
} as const

export class Nyaa extends BaseParser {
  static trackers = [
    'http://nyaa.tracker.wf:7777/announce',
    'udp://open.stealth.si:80/announce',
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://exodus.desync.com:6969/announce',
    'udp://tracker.torrent.eu.org:451/announce',
  ]

  constructor(options: BaseParserOptions = {}) {
    super(options)
  }

  async search<T extends keyof typeof category>(
    options?: BaseParserOptions & {
      /**
       * @default 'all'
       */
      category?: T
      subCategory?: Exclude<keyof typeof category[T], '_'>

      query?: string
      filter?: keyof typeof filter
      /**
       * @default 'id'
       */
      sort?:
        | 'id'
        | 'comments'
        | 'size'
        | 'seeders'
        | 'leechers'
        | 'downloads'
      order?: 'asc' | 'desc'
      /**
       * @default 1
       */
      page?: number
    },
  ) {
    const url = new URL('/', baseUrl)

    if (options?.category && options?.subCategory) {
      url.searchParams.set('c', `${category[options.category]['_']}_${category[options.category][options.subCategory]}`)
    } else if (options?.category) {
      url.searchParams.set('c', `${category[options.category]['_']}_0`)
    } else {
      url.searchParams.set('c', '0_0') // default
    }

    if (options?.filter) url.searchParams.set('f', String(filter[options.filter]))
    if (options?.query) url.searchParams.set('q', options.query)
    if (options?.sort) url.searchParams.set('s', options.sort)
    if (options?.order) url.searchParams.set('o', options.order)
    if (options?.page) url.searchParams.set('p', String(Math.min(Math.max(options.page, 1), Number.MAX_SAFE_INTEGER))) // minmax

    const res = await this.fetch(url, options)
    const doc = await this.DOMParse(res)

    return {
      get response() {
        return res
      },

      data: this.parseSearch(doc),

      /**
       * Pagination info
       */
      page: this.#parseSearchPage(doc),

      /**
       * Has next page
       */
      isEnd: !doc.querySelector('.pagination li:last-child.disabled'),
    }
  }

  parseSearch(document: HTMLDocument) {
    const tableBody = document.querySelector('tbody')

    return Array.from(tableBody?.querySelectorAll('tr') || [], (row) => {
      const cells = Array.from(row.querySelectorAll('td'))

      const category = cells.at(0)?.querySelector('a')?.getAttribute('title')! // category

      const href = cells.at(1)?.querySelector('a')?.getAttribute('href') // title
      const id = parseInt(href?.slice('/view/'.length) || '0', 10)!
      const title = cells.at(1)?.textContent.trim() // title

      const magnetHref = cells.at(2)?.querySelector<HTMLAnchorElement>('a[href^="magnet:"]')?.href // torrent + magnet link

      const size = parseFileSizeToBytes(cells.at(3)?.textContent || '') // size

      const ts = cells.at(4)?.getAttribute('data-timestamp') || '' // date
      const createdAt = new Date(parseInt(ts, 10) * 1000)

      const seeds = parseInt(cells.at(5)?.textContent.trim()!) || 0 // seeders
      const leeches = parseInt(cells.at(6)?.textContent.trim()!) || 0 // leechers
      const downloads = parseInt(cells.at(7)?.textContent.trim()!) || 0 // downloads

      return {
        id,
        title,
        category,
        /**
         * Approximate `size`.
         *
         * The `size` is derived from a string of this type `21.0 GiB`
         */
        size,
        seeds,
        leeches,
        downloads,
        createdAt,

        magnet: magnetHref ? new MagnetURL(magnetHref) : null,
      }
    })
  }

  #parseSearchPage(doc: HTMLDocument) {
    const pagination = doc.querySelector('.pagination')
    const regex = /results (\d+)-(\d+) out of (\d+)/
    const match = doc.querySelector('.pagination-page-info')?.textContent.match(regex)

    if (match) {
      return {
        start: parseInt(match[1]!, 10),
        end: parseInt(match[2]!, 10),
        total: parseInt(match[3]!, 10),
      }
    }
    return null
  }

  async view(options: BaseParserOptions & {id: number}) {
    const res = await this.fetch(new URL(`/view/${options?.id}`, baseUrl), {...options})
    const doc = await this.DOMParse(res)

    return {
      get response() {
        return res
      },

      data: {
        id: options.id,
        ...this.parseView(doc),
      },

      get fileList() {
        return parseFileList(doc)
      },
      get fileListFlatten() {
        const fl = parseFileList(doc)
        if (!fl) return null
        return flattenFileList(fl)
      },
    }
  }

  parseView(document: HTMLDocument) {
    const title = document.querySelector('.panel-title')?.textContent.trim()!

    const data = Object.fromEntries(
      Array.from(
        document.querySelectorAll('.panel-body > .row > .col-md-1'),
        (el) => [el.textContent.toLowerCase().replace(/:$/, ''), el.nextElementSibling],
      ),
    ) as Record<string, HTMLElement>

    // category
    const categoryLinks = data['category']?.querySelectorAll('a')
    categoryLinks

    // create date
    const registerDate = data['date']?.getAttribute('data-timestamp') || ''
    const createdAt = new Date(parseInt(registerDate, 10) * 1000)

    // Submitter
    const submitter = data['submitter']?.querySelector('a') || null // href or 'Anonymous'
    const author = submitter?.href
      ? {
        href: new URL(submitter.href, baseUrl).toString(),
        name: submitter?.textContent.trim(),
      }
      : null

    const seeds = parseInt(data['seeders']?.textContent || '') || 0
    const leeches = parseInt(data['leechers']?.textContent || '') || 0
    const downloads = parseInt(data['completed']?.textContent || '') || 0

    const informationRaw = data['information']?.textContent.trim()
    const information = informationRaw === 'No information.' ? null : String(informationRaw)

    const size = parseFileSizeToBytes(data['file size']?.textContent || '') || 0

    // const infoHash = data['info hash']?.textContent.trim()
    const magnetHref = document.querySelector<HTMLAnchorElement>('.panel-footer a[href^="magnet:"]')?.href

    return {
      title,
      author,
      information,
      /**
       * Approximate `size`.
       *
       * The `size` is derived from a string of this type `21.0 GiB`
       */
      size,
      seeds,
      leeches,
      downloads,
      createdAt,

      magnet: magnetHref ? new MagnetURL(magnetHref) : null,
    }
  }

  async download(options: BaseParserOptions & {id: number}) {
    const res = await this.fetch(new URL(`/download/${options.id}.torrent`, baseUrl), options)
    const filename = this.parseContentDisposition(res)

    return {
      get response() {
        return res
      },
      filename,
      async getFile() {
        return new File(
          [await res.blob()],
          filename!,
          {type: 'application/x-bittorrent'},
        )
      },
    }
  }
}
