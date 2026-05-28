import {DOMParser} from 'linkedom'
import {readFile} from 'node:fs/promises'
import {test} from 'node:test'
import {HDRezka} from './mod.ts'

test('Test 385047', async (t) => {
  // https://hdrezka.me/animation/
  // https://hdrezka.me/animation/?filter=last
  // https://hdrezka.me/animation/action/
  // https://hdrezka.me/animation/best/
  // https://hdrezka.me/animation/best/drama/2026/
  // https://hdrezka.me/animation/best/comedy/2025/page/2/

  const hdrezka = new HDRezka()
  // console.log(await hdrezka.catalog('animation'))
  // console.log(await hdrezka.catalog('animation', {filter: 'popular', genre: 'action', page: 2}))
  // console.log(await hdrezka.catalogBest('animation', {genre: 'action', year: 2025}))
  // console.log(await hdrezka.catalog('series', {}))
  // console.log(await hdrezka.catalogBest('animation', {year: 2026}))
})

test('Test 246396', async (t) => {
  const hdrezka = new HDRezka()

  console.dir(
    await hdrezka.details('https://hdrezka.me/animation/adventures/54982-gintama-final-2021.html'),
    {depth: null},
  )
})

test('Test 103397', async (t) => {
  const {data} = await new HDRezka().details('https://hdrezka.me/animation/adventures/54982-gintama-final-2021.html')
  console.log(data)
  console.log(data.episodes)
})

test('Test 745153', async (t) => {
  const file = await readFile('rezka.html', 'utf8')
  const doc = new DOMParser().parseFromString(file, 'text/html') as unknown as HTMLDocument

  // console.log(doc)
  const a = doc.querySelectorAll('tbody tr')
  console.log(a.length)

  // Object.fromEntries(Array.from(document.querySelectorAll('.b-post__info tbody > tr'), e => [e.querySelector('h2')?.textContent, e]))
})
