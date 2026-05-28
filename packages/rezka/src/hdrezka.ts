import {parseDateString} from '@maks11060/parser-lib/date'
import {detectLanguage} from '@maks11060/parser-lib/lang'
import {type AnyString, baseUrl, CatalogQueryType, type Genres, type Type, userAgent} from './constants.ts'
import {RezkaFetchError, RezkaParseError} from './errors.ts'
import {BaseParser, type BaseParserOptions} from './parser.ts'

const getTypeFromUrl = (url: string | URL): Type => {
  const uri = new URL(url)
  return uri.pathname.split('/')[1] as Type
}

const trim = (v: string) => v.trim()

const toNames = (title?: string) => title ? title.split(' / ') : []

const toNameWithLang = (name: string) => ({name, lang: detectLanguage(name).lang})

// /help/aHR0cHMlM0ElMkYlMkZ3d3cuaW1kYi5jb20lMkZ0aXRsZSUyRnR0MDEyMTk1NSUyRg==/ => https://www.imdb.com/title/tt0121955/
const parseHelpLink = (externalLink: string | null | undefined) => {
  if (!externalLink) return null

  return decodeURIComponent(
    new TextDecoder().decode(Uint8Array.fromBase64(
      externalLink.startsWith('/help/') ? externalLink.slice('/help/'.length, -1) : '',
    )),
  )
}

export class HDRezka extends BaseParser<{baseUrl: string}> {
  constructor(options: BaseParserOptions & {baseUrl?: string; userAgent?: string} = {}) {
    super({baseUrl, ...options})

    this.options.headers = {'User-Agent': options.userAgent ?? userAgent!}
  }

  async details(url: string | URL, options?: BaseParserOptions) {
    const res = await this.fetch(url, {...options})
    if (!res.ok) throw new RezkaFetchError(res)

    const doc = await this.DOMParse(res)

    const data = this.parseDetails(doc)
    return {
      get response() {
        return res
      },
      data: {
        url: res.url || url.toString(),
        type: getTypeFromUrl(url),
        ...data,
      },
    }
  }

  parseDetails(doc: HTMLDocument) {
    const contentMain = doc.body.querySelector('.b-content__main')
    if (!contentMain) throw new RezkaParseError('Empty .b-content__main')

    const url = doc.body.querySelector('.b-container > .b-post > meta[itemprop=url]')?.getAttribute('content')

    // title
    const titles = [
      contentMain?.querySelector('.b-post__title')?.textContent.trim(),
      contentMain?.querySelector('.b-post__origtitle')?.textContent.trim(),
    ].filter(Boolean).flatMap(toNames).map(toNameWithLang)

    // status
    const statusStr = contentMain?.querySelector('.b-post__infolast')?.textContent.trim() || null
    const status = statusStr?.toLowerCase()?.startsWith('завершен') ? 'released' : 'unknown'

    // poster
    const postInfoTableLeft = contentMain?.querySelector('.b-post__infotable_left')
    const poster = {
      lg: postInfoTableLeft?.querySelector('a')?.getAttribute('href') || null,
      md: postInfoTableLeft?.querySelector('img')?.getAttribute('src') || null,
    }

    // info
    const postInfo = contentMain?.querySelector('.b-post__info')!
    if (!postInfo) throw new RezkaParseError('Empty .b-post__info')

    // table rows
    const postEntries = Array.from(
      postInfo.querySelectorAll('tbody > tr'),
      (e) => [e.querySelector('h2')?.textContent, e],
    )
    const post = Object.fromEntries(postEntries) as Record<string, Element>

    // rating (Кинопоиск, IMDB)
    const ratings = Array.from(
      post['Рейтинги']?.querySelectorAll('.b-post__info_rates') || [],
      (e) => {
        const scoreText = e.querySelector('span')?.textContent
        const countText = e.querySelector('i')?.textContent?.match(/\d+/g)?.join('') || '0'

        return {
          type: e.querySelector('a')?.textContent || '',
          score: scoreText ? parseFloat(scoreText) : 0,
          count: parseInt(countText, 10),
          href: parseHelpLink(e.querySelector('a')?.getAttribute('href')),
        }
      },
    ).filter((r) => r.type && !isNaN(r.score) && r.score > 0)

    const externalLinks = ratings.filter((v) => v.href).map((v) => v.href) as string[]

    // rating (Rezka)
    const ratingEl = contentMain?.querySelector('.b-post__rating')
    const count = Number(ratingEl?.querySelector('.votes > span')?.textContent)
    const score = Number(ratingEl?.querySelector('.num')?.textContent)
    if (count && score) ratings.push({type: 'hdrezka', score, count, href: url || null})

    // lists (top)
    const lists = Array.from(
      post['Входит в списки']?.querySelectorAll('td:nth-child(2) a') || [],
      (el) => ({
        name: el.textContent,
        href: el.getAttribute('href')!,
        place: parseInt((el.nextSibling?.textContent?.match(/\((\d+)/) || [, 0])[1] as string, 10),
      }),
    )

    // slogan
    const slogan = post['Слоган']?.querySelector('td:nth-child(2)')?.textContent || null

    // release date
    const releaseDate = parseDateString(post['Дата выхода']?.querySelector('td:nth-child(2)')?.textContent)

    // countries
    const countries = Array.from(
      post['Страна']?.querySelectorAll('td:nth-child(2) a') || [],
      (el) => el.textContent,
    )

    // genres
    const genres = post['Жанр']?.querySelector('td:nth-child(2)')?.textContent?.split(',').map(trim) || []

    // dubs
    const dubs = post['В переводе']?.querySelector('td:nth-child(2)')?.textContent?.split(/\, |\sи\s/).map(trim) || []

    // duration in min
    const durationStr = post['Время']?.querySelector('td:nth-child(2)')?.textContent || ''
    const duration = parseInt(durationStr.split(' ', 1).join(''), 10) || null

    const directors = Array.from(
      post['Режиссер']?.querySelectorAll('td:nth-child(2) a') || [],
      (el) => ({
        name: el?.textContent,
        href: el?.getAttribute('href')!,
        poster: el.parentElement?.getAttribute('data-photo') === 'null'
          ? null
          : el.parentElement?.getAttribute('data-photo')!,
      }),
    )

    const persons = Array.from(
      post['В ролях актеры']?.querySelectorAll('a') || [],
      (el) => ({
        name: el?.textContent,
        href: el?.getAttribute('href')!,
        poster: el.parentElement?.getAttribute('data-photo') === 'null'
          ? null
          : el.parentElement?.getAttribute('data-photo')!,
      }),
    )

    const rating = post['Возраст']?.querySelector('span')?.textContent || null

    // collections
    const collections = Array.from(
      post['Из серии']?.querySelectorAll('td:nth-child(2) a') || [],
      (el) => ({
        name: el.textContent,
        href: el.getAttribute('href')!,
      }),
    )

    // description
    const description = contentMain?.querySelector('.b-post__description_text')?.textContent?.trim() || null

    // related content
    const related = Array.from(
      contentMain?.querySelectorAll('.b-post__partcontent_item:not(.current)') || [],
      (e) => ({
        // name: e.querySelector('.title')?.textContent!,
        titles: toNames(e.querySelector('.title')?.textContent!).map(toNameWithLang),
        href: e.getAttribute('data-url')!,
        year: Number(e.querySelector('.year')?.textContent.split(' ', 2).at(0)) || null,
        rating: Number(e.querySelector('.rating')?.textContent) || null,
      }),
    )

    // episodes
    const episodes = Array.from(
      contentMain?.querySelectorAll('.b-post__schedule .b-post__schedule_table tbody tr') || [],
      (e) => {
        const textContent = e.querySelector('.td-1')?.textContent || ''
        const parts = textContent.split(' ', 4)
        const titles = ([
          e.querySelector('.td-2 b')?.textContent,
          e.querySelector('.td-2 span')?.textContent,
        ].filter(Boolean) as string[]).map(toNameWithLang)
        const airDate = e.querySelector('.td-4')?.textContent

        return {
          season: parts[0] ? parseInt(parts[0]) : 0,
          episode: parts[2] ? parseInt(parts[2]) : 0,
          titles,
          airDate: parseDateString(airDate),
        }
      },
    ).filter((v) => v.season && v.episode)

    return {
      titles,
      poster,
      status,
      ratings,
      releaseDate,
      countries,
      genres,
      duration,
      rating,
      slogan,
      dubs,
      description,
      lists,
      collections,
      directors,
      persons,
      related,
      externalLinks,
      get episodes() {
        return episodes
      },
    } as const
  }

  async catalog<Type extends keyof Genres>(
    type: Type,
    query?: BaseParserOptions & {
      filter?: 'last' | 'popular' | 'soon' | 'watching' | AnyString
      genre?: Genres[Type]
      page?: number
    },
  ) {
    const url = new URL(`/${type}/`, this.options.baseUrl)

    if (query) {
      if (query.genre) url.pathname += `${query.genre}/`
      if (query.page && query.page > 1) url.pathname += `page/${query.page}/`
      if (query.filter) url.searchParams.set('filter', query.filter)
    }

    const response = await this.fetch(url, {...query})
    if (!response.ok) throw new RezkaFetchError(response)
    const doc = await this.DOMParse(response)
    const data = this.parseCatalog(doc)

    return {
      get response() {
        return response
      },
      data,
    }
  }

  async catalogBest<Type extends keyof Genres>(
    type: Type,
    query?: BaseParserOptions & {
      genre?: Genres[Type]
      year?: number
      page?: number
    },
  ) {
    const url = new URL(`/${type}/best/`, this.options.baseUrl)

    if (query) {
      if (query.genre) url.pathname += `${query.genre}/`
      if (query.year) url.pathname += `${query.year}/`
      if (query.page && query.page > 1) url.pathname += `page/${query.page}/`
    }

    const response = await this.fetch(url, {...query})
    if (!response.ok) throw new RezkaFetchError(response)
    const doc = await this.DOMParse(response)
    const data = this.parseCatalog(doc)

    return {
      get response() {
        return response
      },
      data,
    }
  }

  async catalogNew(
    query?: BaseParserOptions & {
      filter?: 'last' | 'popular' | 'watching' | AnyString
      genre?: keyof typeof CatalogQueryType
      page?: number
    },
  ) {
    const url = new URL(`/new/`, this.options.baseUrl)

    if (query) {
      if (query.page && query.page > 1) url.pathname += `page/${query.page}/`
      if (query.genre) url.searchParams.set('genre', String(CatalogQueryType[query.genre]))
    }

    const response = await this.fetch(url, {...query})
    if (!response.ok) throw new RezkaFetchError(response)
    const doc = await this.DOMParse(response)
    const data = this.parseCatalog(doc)

    return {
      get response() {
        return response
      },
      data,
    }
  }

  async catalogAnnounce(query?: BaseParserOptions & {page?: number}) {
    const url = new URL(`/announce/`, this.options.baseUrl)

    if (query?.page && query.page > 1) url.pathname += `page/${query.page}/`

    const response = await this.fetch(url, {...query})
    if (!response.ok) throw new RezkaFetchError(response)
    const doc = await this.DOMParse(response)
    const data = this.parseCatalog(doc)

    return {
      get response() {
        return response
      },
      data,
    }
  }

  parseCatalog(doc: HTMLDocument) {
    const itemsEl = doc.querySelector('.b-content__inline_items')
    const items = Array.from(
      itemsEl?.querySelectorAll('.b-content__inline_item') ?? [],
      (el) => {
        const id = el.getAttribute('data-id')
        const url = el.getAttribute('data-url')

        const img = el.querySelector('.b-content__inline_item-cover img')?.getAttribute('src') ?? null

        const title = el.querySelector('.b-content__inline_item-link a')?.textContent ?? null
        const linkText = el.querySelector('.b-content__inline_item-link div')?.textContent

        const [yearRange, ...tags] = linkText?.split(',').map((v) => v.trim()) ?? []
        const [yearStart = null, yearEnd = null] = yearRange?.split('-')
          .map((v) => (isNaN(parseInt(v)) ? null : parseInt(v))) ?? []

        return {
          id,
          title,
          tags,
          yearStart,
          yearEnd,
          img,
          url,
        }
      },
    )

    return items
  }

  async search(options: BaseParserOptions & {query: string}) {
    const url = new URL('/engine/ajax/search.php', this.options.baseUrl)
    const body = new FormData()
    body.set('q', options.query.trim())

    const response = await this.fetch(url, {
      method: 'POST',
      body,
    })
    if (!response.ok) throw new RezkaFetchError(response)
    const doc = await this.DOMParse(response)
    const data = this.parseSearch(doc)

    return {
      get response() {
        return response
      },
      data,
    }
  }

  parseSearch(doc: HTMLDocument) {
    return Array.from(doc.querySelectorAll('li'), (e) => {
      const title = e.querySelector('.enty')
      const titleOrig = title?.nextSibling?.textContent?.trim() || null

      const rating = e.querySelector('.rating')
      const ratingTitle = rating?.querySelector('i')?.getAttribute('title')

      return {
        title: title?.textContent,
        titleOrig,
        href: e.querySelector('a')?.getAttribute('href'),
        rating: {
          type: /кинопоиск/i.test(ratingTitle || '') ? 'Кинопоиск' : null,
          score: parseFloat(rating?.textContent || '') || null,
          count: parseInt(/\d+/.exec(ratingTitle || '')?.[0] || '', 10) || null,
        },
      }
    })
  }
}
