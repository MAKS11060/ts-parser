import {test} from 'node:test'
import {catalog} from './animego.ts'

test('Test029362', async (t) => {
  // https://animego.me/anime
  // https://animego.me/anime/2
  // https://animego.me/anime/filter/year-from-1959-to-1960/apply

  // console.log(await catalog({year: 2000}))
  // console.log(await catalog({year: {from: 2000}}))
  // console.log(await catalog({year: {to: 2026}}))
  // console.log(await catalog({year: {from: 2000, to: 2026}}))
  // console.log(await catalog({genres: ['action', 'fantasy']}))
  // console.log(await catalog({genres: ['action', 'adventure']}))
  // console.log(await catalog({genres: {include: ['action', 'adventure'], exclude: ['fantasy']}}))
  // console.log(await catalog({page: 2}))
})
