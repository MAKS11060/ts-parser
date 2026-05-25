import {equal} from 'node:assert'
import {test} from 'node:test'
import {parseDateString} from './date.ts'

test('parseDateString()', () => {
  equal(parseDateString('11 января 2011')?.toLocaleString(), '11.01.2011, 00:00:00')
  equal(parseDateString('11 январ 2011')?.toLocaleString(), null)
  equal(parseDateString('32 января 2011')?.toLocaleString(), null)
  equal(parseDateString('0 января 2011')?.toLocaleString(), null)
})
