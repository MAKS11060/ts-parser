#!/usr/bin/env -S deno run -A --env-file --watch-hmr

import {sValidator} from '@hono/standard-validator'
import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {logger} from 'hono/logger'
import {z} from 'zod'
import {serve} from './test/deno.ts'

const app = new Hono()
  .use(cors())
  .use(logger())

app.get(
  '/',
  sValidator(
    'query',
    z.object({
      query: z.string(),
      category: z.coerce.number().default(0),
      page: z.coerce.number().default(0),
      year: z.coerce.number().default(0),
      format: z.coerce.number().default(0),
    }).partial(),
  ),
  (c) => {
    let {category: categoryId, format, page, query, year} = c.req.valid('query')
    query = encodeURIComponent(query || '')

    // default value
    if (!page || (page !== 'all' && isNaN(page))) page = 0
    if (!categoryId || !/^[0-9]+$/.test(categoryId)) categoryId = 0
    if (!year || !/^[0-9]{4}$/.test(year)) year = 0

    if (format === 720) format = 3002
    else if (format === 1080) format = 3001
    else if (format === 2160) format = 7
    else format = 0

    // const provider = 'rutracker'
    // if

    return c.json({})
  },
)

serve(app.fetch)
