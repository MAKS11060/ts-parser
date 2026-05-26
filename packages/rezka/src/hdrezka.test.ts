import {test} from 'node:test'
import {HDRezka} from './hdrezka.ts'

// dprint-ignore
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'

test('Test 475521', async (t) => {
  const hdrezka = new HDRezka({
    userAgent,
    async fetch(input, init) {
      const request = new Request(input, init)
      console.log(request.headers)

      return new Response(null, {status: 500})
    },
  })

  const {response, data} = await hdrezka.catalogAnnounce({page: 123})
  console.log(data)
})
