import {DOMParser, type HTMLDocument} from '@b-fuze/deno-dom'
import {config} from './config.ts'
import type {AnyString, BaseOptions, Duration, Genres, OrArray, RatingMPAA, Status, Type} from './types.ts'

interface CatalogOptions extends BaseOptions {
  // --- path params ---
  page?: number
  year?: number | {from?: number; to?: number}
  /**
   * Genre search mode:
   * - `false` - `or`
   * - `true`  - `and`
   *
   * @default false
   */
  genresStrict?: boolean
  genres?: (Genres | `!${Genres}` | AnyString)[] | Record<'include' | 'exclude', (Genres | AnyString)[]>
  type?: OrArray<Type>
  status?: OrArray<Status>
  rating?: OrArray<RatingMPAA>
  duration?: OrArray<Duration>

  // --- query params ---
  sort?: 'createdAt' | 'startDate' | 'rating'
  direction?: 'asc' | 'desc'
  view?: 'grid' | 'grid2' | 'list'
}

interface CatalogEntriesJsonResponse {
  status: 'success' | AnyString
  message: null | string
  data: {
    content: string
    view: Type
    endPage: boolean
    page: number
    url: string
    seo: {
      title: string
      description: string
      keywords: string
      noindex: boolean
      nofollow: boolean
      robots: []
    }
    pageTitle: string
    pageDescription: null | string
  }
}

export const catalog = async (options?: CatalogOptions) => {
  const uri = new URL('/anime', options?.base ?? config.base)

  if (options?.page && options.page > 1) uri.pathname += `/${options?.page}`

  // years range
  if (typeof options?.year === 'number' && options?.year > 1958) {
    uri.pathname += `/filter`
    uri.pathname += `/${options.year}`
  } else if (typeof options?.year === 'object') {
    if (options.year.from || options.year.to) uri.pathname += `/year`
    if (options.year.from) uri.pathname += `-from-${options.year.from}`
    if (options.year.to) uri.pathname += `-to-${options.year.to}`
  }

  // genres
  if (Array.isArray(options?.genres)) {
    uri.pathname += `/genres-is-${options.genres.join(options?.genresStrict ? '-and-' : '-or-')}`
  } else {
    const genres = [
      ...options?.genres?.include || [],
      ...options?.genres?.exclude.map((v) => `!${v}`) || [],
    ]
    if (genres.length > 0) uri.pathname += `/genres-is-${genres.join(options?.genresStrict ? '-and-' : '-or-')}`
  }

  // type
  if (Array.isArray(options?.type)) {
    uri.pathname += `/type-is-${options.type.join('-or-')}`
  } else if (typeof options?.type === 'string') {
    uri.pathname += `/type-is-${options.type}`
  }

  // status
  if (Array.isArray(options?.status)) {
    uri.pathname += `/status-is-${options.status.join('-or-')}`
  } else if (typeof options?.status === 'string') {
    uri.pathname += `/status-is-${options.status}`
  }

  // rating
  if (Array.isArray(options?.rating)) {
    uri.pathname += `/ratingMPAA-is-${options.rating.join('-or-')}`
  } else if (typeof options?.rating === 'string') {
    uri.pathname += `/ratingMPAA-is-${options.rating}`
  }
  // duration
  if (Array.isArray(options?.duration)) {
    uri.pathname += `/duration-is-${options.duration.join('-or-')}`
  } else if (typeof options?.duration === 'string') {
    uri.pathname += `/duration-is-${options.duration}`
  }

  // if at least one filter is installed
  if (uri.pathname !== '/anime') uri.pathname += '/apply'

  // query
  if (options?.sort) uri.searchParams.set('sort', options.sort)
  if (options?.direction) uri.searchParams.set('direction', options.direction)
  if (options?.view) uri.searchParams.set('view', options.view)

  // return uri.toString()
  const _fetch = options?.fetch ?? config.fetch ?? fetch
  const response = await _fetch(uri, {
    headers: {
      'user-agent': options?.userAgent ?? config.userAgent!,
      ...config.headers,
      ...options?.headers,
    },
  })

  const isEntities = response.headers.get('content-type')?.startsWith('application/json')
  if (isEntities) {
    throw new Error('Not implemented') // TODO
    // const data = await response.json() as CatalogEntriesJsonResponse
  }

  // html
  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  if (!options?.view || options.view === 'list') {
    return catalogParseList(doc)
  } else if (options.view === 'grid2') {
    return catalogParseGrid2(doc)
  } else if (options.view === 'grid') {
    throw new Error('Not implemented')
  }
}

const catalogParseList = (doc: HTMLDocument) => {
  const container = doc.querySelector('#content-container')

  return Array.from(container?.querySelectorAll('.ani-list__item') || [], (e) => {
    const anchor = e.querySelector('.image__picture')
    const href = anchor?.getAttribute('href')

    const image = anchor?.querySelector('img')
    const imageSrc = image?.getAttribute('src')!
    const imageAlt = image?.getAttribute('alt')!

    const body = e.querySelector('.ani-list__item-body')
    const title = body?.querySelector('.ani-list__item-title')?.textContent.trim() || null
    const titleOrig = body?.querySelector('.ani-list__item-title')?.nextElementSibling
      ?.textContent.split('\n').map((v) => v.trim()).join(' ').trim() || null

    const tags = Array.from(body?.querySelectorAll('.ani-list__item-genres__link') || [], (e) => {
      const href = e.getAttribute('href')

      if (href?.startsWith('/anime/type/')) {
        return ['type', href.slice('/anime/type/'.length)]
      }
      if (href?.startsWith('/anime/season/')) {
        return ['year', parseInt(href.slice('/anime/season/'.length), 10) || null]
      }
      if (href?.startsWith('/anime/genre/')) {
        return ['genre', href.slice('/anime/genre/'.length)]
      }
    }) as (['type', Type] | ['year', number | null] | ['genre', string])[]

    return {
      href,
      title,
      titleOrig,
      type: tags.find(([k]) => k === 'type')?.[1],
      year: tags.find(([k]) => k === 'year')?.[1],
      genres: tags.filter(([k]) => k === 'genre')?.map((v) => v[1]),

      image: {
        src: imageSrc,
        alg: imageAlt,
      },
    }
  })
}

const catalogParseGrid2 = (doc: HTMLDocument) => {
  const container = doc.querySelector('#content-container')

  return Array.from(container?.querySelectorAll('.ani-grid2__item') || [], (e) => {
    const anchor = e.querySelector('.image__picture')
    const href = anchor?.getAttribute('href')

    const image = anchor?.querySelector('img')
    const imageSrc = image?.getAttribute('src')!
    const imageAlt = image?.getAttribute('alt')!

    const body = e.querySelector('.ani-grid2__item-body')
    const title = body?.querySelector('.ani-grid2__item-title')?.textContent.trim() || null
    const titleOrig = body?.querySelector('.ani-grid2__item-title')?.nextElementSibling
      ?.textContent.split('\n').map((v) => v.trim()).join(' ').trim() || null

    const tags = Array.from(body?.querySelectorAll('.ani-grid2__item-genres__link') || [], (e) => {
      const href = e.getAttribute('href')

      if (href?.startsWith('/anime/type/')) {
        return ['type', href.slice('/anime/type/'.length)]
      }
      if (href?.startsWith('/anime/season/')) {
        return ['year', parseInt(href.slice('/anime/season/'.length), 10) || null]
      }
      if (href?.startsWith('/anime/genre/')) {
        return ['genre', href.slice('/anime/genre/'.length)]
      }
    }) as (['type', Type] | ['year', number | null] | ['genre', string])[]

    return {
      href,
      title,
      titleOrig,
      type: tags.find(([k]) => k === 'type')?.[1],
      year: tags.find(([k]) => k === 'year')?.[1],
      genres: tags.filter(([k]) => k === 'genre')?.map((v) => v[1]),

      image: {
        src: imageSrc,
        alg: imageAlt,
      },
    }
  })
}
