import test from 'node:test'
import {RuTracker} from './rutracker.ts'

test('Test 210891', async (t) => {
  const ruTracker = new RuTracker({session: process.env.RUTRACKER_SESSION!})
  const res = await ruTracker.search({query: ''})

  console.dir(res, {depth: null})
})

test('Test 591098', async (t) => {
  const ruTracker = new RuTracker({session: process.env.RUTRACKER_SESSION!})
  const res = await ruTracker.download({id: 6842981})
  console.log(res.response)
  console.log(res.getFile())
})

test('Test 591011', async (t) => {
  const ruTracker = new RuTracker({session: process.env.RUTRACKER_SESSION!})
  const res = await ruTracker.view({id: 6842981})
  console.log(res)
})
