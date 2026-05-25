export {config, setConfig} from './src/core/config.ts'
export {CatalogQueryType, genres} from './src/core/constants.ts'
export type {BaseOptions, Genres, Type} from './src/core/constants.ts'
export * as errors from './src/core/errors.ts'
export {parseUri} from './src/core/utils.ts'

export {catalog} from './src/parser/catalog.ts'
export {getDetails} from './src/parser/datail.ts'
export {search} from './src/parser/search.ts'
