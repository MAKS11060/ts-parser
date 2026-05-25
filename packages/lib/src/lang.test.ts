import {deepStrictEqual} from 'node:assert'
import {test} from 'node:test'
import {detectLanguage} from './lang.ts'

test('Test 845411', async (t) => {
  const values = [
    {
      text: 'Hello, Мир!',
      expect: {lang: 'en', score: 0.63, scores: {en: 5, ru: 3}},
    },
    {
      text: ', !',
      expect: {lang: null, score: 0, scores: {en: 0, ru: 0}},
    },
    {
      text: '',
      expect: {lang: null, score: 0, scores: {en: 0, ru: 0}},
    },
  ]

  for (const {text, expect} of values) {
    deepStrictEqual(detectLanguage(text), expect)
  }
})
