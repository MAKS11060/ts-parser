import type {BaseOptions} from './types.ts'

export const config: BaseOptions = {
  base: 'https://animego.me',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
}

export const setConfig = (options: Partial<BaseOptions>) => {
  Object.assign(config, options)
}
