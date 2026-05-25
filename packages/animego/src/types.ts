export interface BaseOptions {
  fetch?: typeof fetch
  headers?: HeadersInit

  /** @default 'https://animego.me' */
  base?: string
  userAgent?: string
}

export type AnyString = {} & string
export type OrArray<T> = T | T[]

//
/* // Generate type Genres from array
console.log(
  `type Genres = \n  |`,
  [...temp1.querySelectorAll('input')]
    .map((v) => [v.value, v.dataset.text]).filter((v) => !v[0].startsWith('!'))
    .map((v) => `'${v[0]}' // ${v[1]}`).join('\n  | '),
)
*/
export type Genres =
  | 'cgdct' // CGDCT
  | 'avant-garde' // Авангард
  | 'anthropomorphic' // Антропоморфизм
  | 'martial-arts' // Боевые искусства
  | 'vampire' // Вампиры
  | 'adult-cast' // Взрослые персонажи
  | 'video-game' // Видеоигры
  | 'military' // Военное
  | 'survival' // Выживание
  | 'harem' // Гарем
  | 'racing' // Гонки
  | 'urban-fantasy' // Городское фэнтези
  | 'gourmet' // Гурман
  | 'gag-humor' // Гэг-юмор
  | 'detective' // Детектив
  | 'kids' // Детское
  | 'josei' // Дзёсей
  | 'drama' // Драма
  | 'gore' // Жестокость
  | 'childcare' // Забота о детях
  | 'villainess' // Злодейка
  | 'high-stakes-game' // Игра с высокими ставками
  | 'idols-female' // Идолы (Жен.)
  | 'idols-male' // Идолы (Муж.)
  | 'visual-arts' // Изобразительное искусство
  | 'performing-arts' // Исполнительское искусство
  | 'historical' // Исторический
  | 'isekai' // Исэкай
  | 'iyashikei' // Иясикэй
  | 'team-sports' // Командный спорт
  | 'comedy' // Комедия
  | 'space' // Космос
  | 'crossdressing' // Кроссдрессинг
  | 'otaku-culture' // Культура отаку
  | 'love-polygon' // Любовный многоугольник
  | 'magical-sex-shift' // Магическая смена пола
  | 'mahou-shoujo' // Махо-сёдзё
  | 'medical' // Медицина
  | 'mecha' // Меха
  | 'mythology' // Мифология
  | 'music' // Музыка
  | 'educational' // Образовательное
  | 'organized-crime' // Организованная преступность
  | 'parody' // Пародия
  | 'pets' // Питомцы
  | 'slice-of-life' // Повседневность
  | 'adventure' // Приключения
  | 'psychological' // Психологическое
  | 'time-travel' // Путешествие во времени
  | 'workplace' // Работа
  | 'reverse-harem' // Реверс-гарем
  | 'reincarnation' // Реинкарнация
  | 'romance' // Романтика
  | 'love-status-quo' // Романтический подтекст
  | 'samurai' // Самураи
  | 'supernatural' // Сверхъестественное
  | 'shoujo' // Сёдзё
  | 'shounen' // Сёнен
  | 'sports' // Спорт
  | 'combat-sports' // Спортивные единоборства
  | 'strategy-game' // Стратегические игры
  | 'super-power' // Супер сила
  | 'seinen' // Сэйнэн
  | 'mystery' // Тайна
  | 'suspense' // Триллер
  | 'horror' // Ужасы
  | 'sci-fi' // Фантастика
  | 'fantasy' // Фэнтези
  | 'delinquents' // Хулиганы
  | 'school' // Школа
  | 'showbiz' // Шоу-бизнес
  | 'action' // Экшен
  | 'erotica' // Эротика
  | 'ecchi' // Этти

export type Type = `tv` | `movie` | `ova` | `special` | `ona`
export type Status = `ongoing` | `released` | `anons` | `latest`
export type RatingMPAA = 'G' | 'PG' | 'PG-13' | 'R-17' | 'R+'
export type Duration = `short` | `medium` | `long` | `huge`

// --- constants ---
export const TypeMap = new Map<string, Type>([
  ['Сериал', 'tv'],
  ['Фильм', 'movie'],
  ['Спешл', 'special'],
  ['ONA', 'ona'],
  ['OVA', 'ova'],
])
