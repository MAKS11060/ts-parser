import test from 'node:test'
import {RuTracker} from './rutracker.ts'

const ruTracker = new RuTracker({
  session: process.env.RUTRACKER_SESSION!,
  async fetch(input, init) {
    console.log('proxy', input)
    const request = new Request(input, init)
    const res = await fetch(`https://proxy.maks11060.workers.dev/${request.url}`, request)
    return res
  },
})

test('Test 210891', async (t) => {
  const res = await ruTracker.search({query: ''})
  console.dir(res, {depth: null})
})

test('Test 591098', async (t) => {
  const res = await ruTracker.download({id: 6842981})
  console.log(res.response)
  console.log(res.getFile())
})

test('Test 591011', async (t) => {
  const res = await ruTracker.view({id: 6842981})
  console.log(res)
})

test('Test 291087', async (t) => {
  const res = await ruTracker.viewTorrent({id: 6842981})
  console.log(res.response)
  console.dir(res.fileList, {depth: null})
})
