# ts-parser

[![CI](https://github.com/MAKS11060/ts-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/MAKS11060/ts-parser/actions/workflows/ci.yml)

Api based on html parsing

## api-tracker

```ts
import {RuTracker} from '@maks11060/api-tracker'

process.env.RUTRACKER_SESSION ??= '' // from cookie 'bb_session=0-000000000-XXXXXXXXXXXXXXXXXXXXX'

const ruTracker = new RuTracker({session: process.env.RUTRACKER_SESSION!})

const res = await ruTracker.search({query: ''})
/* {
  readonly response: Response;
  data: {
    id: number;
    href: string;
    title: string;
    status: "Approved" | "Consumed" | "Dubiously" | "NeedEdit" | "NotApproved" | "Temporary";
    statusRU: string;
    category: {
      id: number;
      name: string;
      href: string;
    };
    author: {
      id: number;
      name: string;
      href: string;
    };
    size: number;
    seeds: number;
    leeches: number;
    downloads: number;
    createdAt: Date;
  }[]
} */

const res = await ruTracker.download({id: 6842981})
/* {
  readonly response: Response;
  filename: string;
  getFile(): Promise<File>;
} */

const res = await ruTracker.view({id: 6842981})
/* {
  readonly response: Response;
  id: number;
  size: number | null;
  magnet: MagnetURL | null;
} */
```
