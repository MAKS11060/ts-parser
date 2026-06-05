import test from 'node:test'
import {Nyaa} from './nyaa.ts'

const nyaa = new Nyaa()

test('Test 451473 nyaa.search', async (t) => {
  // const res = await nyaa.search()
  // const res = await nyaa.search({category: 'audio', subCategory: 'lossless'})
  const res = await nyaa.search({category: 'audio', query: 'zenless', sort: 'downloads'})
  console.dir(res, {depth: null})
})

test('Test 754187 nyaa.view', async (t) => {
  // const res = await nyaa.view({id: 2117532})
  // const res = await nyaa.view({id: 2114164})
  const res = await nyaa.view({id: 1848528})
  console.dir(res, {depth: null})
  // console.dir(res.data.magnet?.trackers, {depth: null})
  // console.dir(res?.fileList, {depth: null})
  console.dir(res?.fileListFlatten, {depth: null})
})

test('Test 754182 nyaa.download', async (t) => {
  const res = await nyaa.download({id: 2117532})
  console.log(res.response.headers)
  console.log(res.filename)
  console.log(await res.getFile())

  // console.dir(res, {depth: null})
})
