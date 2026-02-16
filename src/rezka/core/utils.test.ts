import {deepStrictEqual} from 'node:assert/strict'
import {test} from 'node:test'
import {parseUri} from './utils.ts'

test('parseUri()', async (t) => {
  deepStrictEqual(
    parseUri(
      'https://hdrezka.me/cartoons/comedy/1760-yuzhny-park-1997-latest.html',
    ),
    {
      type: 'rezkaDetails',
      params: {
        genre: 'comedy',
        id: '1760',
        latest: '-latest',
        title: 'yuzhny-park',
        type: 'cartoons',
        year: '1997',
      },
    },
  )

  deepStrictEqual(
    parseUri(
      'https://hdrezka.me/cartoons/comedy/1760-yuzhny-park-1997-latest/111-hdrezka-studio/27-season/3-episode.html',
    ),
    {
      type: 'rezkaDetailsWithEpisode',
      params: {
        type: 'cartoons',
        genre: 'comedy',
        id: '1760',
        title: 'yuzhny-park',
        year: '1997',
        latest: '-latest',
        dub_id: '111',
        dub_name: 'hdrezka-studio',
        season: '27',
        episode: '3',
      },
    },
  )
})
