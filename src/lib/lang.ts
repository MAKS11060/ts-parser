const LANGUAGE_PATTERNS = {
  en: /[a-zA-Z]/gu,
  ru: /[а-яА-ЯёЁ]/gu,
  // zh: /\p{Script=Han}/gu,
  // ja: /[\p{Script=Hiragana}\p{Script=Katakana}]/gu,
  // ko: /\p{Script=Hangul}/gu,
  // ar: /\p{Script=Arabic}/gu,
  // hi: /\p{Script=Devanagari}/gu,
  // de: /[äöüßÄÖÜ]/gu,
} as const

export const detectLanguage = (text: string) => {
  const scores: Record<string, number> = {}
  let totalLetterCount = 0

  for (const lang in LANGUAGE_PATTERNS) {
    const matches = text.match(LANGUAGE_PATTERNS[lang as keyof typeof LANGUAGE_PATTERNS]) || []
    scores[lang] = matches.length
    totalLetterCount += matches.length
  }

  if (totalLetterCount === 0) {
    return {
      lang: null,
      score: 0,
      get scores() {
        return scores
      },
    }
  }

  let bestLang: string | null = null
  let maxCount = 0

  for (const [lang, count] of Object.entries(scores)) {
    if (count > maxCount) {
      maxCount = count
      bestLang = lang
    } else if (count === maxCount && count > 0) {
      bestLang = null
    }
  }

  return {
    lang: bestLang as keyof typeof LANGUAGE_PATTERNS | null,
    score: Number((maxCount / totalLetterCount).toFixed(2)),
    get scores() {
      return scores
    },
  }
}
