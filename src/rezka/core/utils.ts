import {URLPatternTyped} from '@maks11060/web/url-pattern'

// dprint-ignore
export const patterns = {
  rezkaDetails: new URLPatternTyped({
    pathname: '/:type/:genre/:id(\\d+)-:title(.*)-:year(\\d{4}):latest(-latest)?.html',
  }),
  rezkaDetailsWithEpisode: new URLPatternTyped({
    pathname: '/:type/:genre/:id(\\d+)-:title(.*)-:year(\\d{4}):latest(-latest)?/:dub_id(\\d+)-:dub_name(.*)/:season(\\d+)-season/:episode(\\d+)-episode.html',
  }),
}

export const parseUri = (url: string | URL) => {
  if (patterns.rezkaDetails.test(url)) {
    return {
      type: 'rezkaDetails',
      params: patterns.rezkaDetails.exec(url)?.pathname.groups!,
    } as const
  } else if (patterns.rezkaDetailsWithEpisode.test(url)) {
    return {
      type: 'rezkaDetailsWithEpisode',
      params: patterns.rezkaDetailsWithEpisode.exec(url)?.pathname.groups!,
    } as const
  }
}
