export {config, setConfig} from './core/config.ts'
export {CatalogQueryType, genres} from './core/constants.ts'
export type {BaseOptions, Genres, Type} from './core/constants.ts'
export * as errors from './core/errors.ts'
export {parseUri} from './core/utils.ts'

export {catalog} from './parser/catalog.ts'
export {getDetails} from './parser/datail.ts'
export {search} from './parser/search.ts'
