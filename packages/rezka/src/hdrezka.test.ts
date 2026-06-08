import {test} from 'node:test'
import {HDRezka} from './hdrezka.ts'

test('Test 475521', async (t) => {
  const hdrezka = new HDRezka({
    async fetch(input, init) {
      const request = new Request(input, init)
      console.log(request.headers)

      return new Response(null, {status: 500})
    },
  })

  const {response, data} = await hdrezka.catalogAnnounce({page: 123})
  console.log(data)
})

test('Test 619511', async (t) => {
  const hdrezka = new HDRezka({
    async fetch(input, init) {
      const request = new Request(input, init)
      console.log(request.url)

      return new Response(null, {status: 500})
    },
  })

  await hdrezka.search({query: '123', baseUrl: 'https://localhost/1'})
})
