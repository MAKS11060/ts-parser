/**
 * Parse formatted data string
 * @param dateString - '11 января 2011'
 */
export const parseDateString = (dateString?: string): Date | null => {
  if (!dateString) return null
  // dprint-ignore
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]

  const regex = /(\d{1,2})\s+([а-яА-Я]+)\s+(\d{4})/ // day month year
  // const regex = /^(\d{1,2})\s+([а-яА-Я]+)\s+(\d{4})$/
  const match = dateString.trim().match(regex)

  if (match && match.length > 2) {
    const day = parseInt(match[1]!, 10)
    const month = match[2]!
    const year = parseInt(match[3]!, 10)

    const monthIndex = months.indexOf(month.toLowerCase())
    if (monthIndex !== -1) {
      const date = new Date(year, monthIndex, day)

      if (date.getDate() === day && date.getMonth() === monthIndex && date.getFullYear() === year) {
        return date
      }
    }
  }

  return null
}
