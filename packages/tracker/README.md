# API parser for torrent tracker

## Nyaa (hyaa.si)

```ts
import {Nyaa} from '@maks11060/api-tracker'

const nyaa = new Nyaa()
```

Search

```ts
const res = await nyaa.search({
  category: 'audio',
  query: 'zenless',
  sort: 'downloads',
})
/* {
  response: [Getter],
  data: [{
    id: number,
    title: string,
    category: string,
    size: number,
    seeds: number,,
    leeches: number,,
    downloads: number,,
    createdAt: Date,
    magnet: MagnetURL [magnet:?xt=urn:btih:0000000000000000000000000000000000000000] {}
  }],
  page: {start: 1, end: 27, total: 27},
  isEnd: boolean
} */
```

Show current page

```ts
const res = await nyaa.view({id: 1848528})
/* {
  response: [Getter],
  data: {
    id: number,
    title: string,
    author: { href: string, name: string } | null,
    information: string | null,
    size: number,
    seeds: number,
    leeches: number,
    downloads: number,
    createdAt: Date,
    magnet: MagnetURL [magnet:?xt=urn:btih:0000000000000000000000000000000000000000] {}
  },
  fileList: [Getter],
  fileListFlatten: [Getter]
} */
```

## RuTracker

```ts
import {RuTracker} from '@maks11060/api-tracker'

process.env.RUTRACKER_SESSION ??= '' // from cookie 'bb_session=0-000000000-XXXXXXXXXXXXXXXXXXXXX'

const ruTracker = new RuTracker({session: process.env.RUTRACKER_SESSION!})
```

Search

```ts
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
```

Download `.torrent` file

```ts
const res = await ruTracker.download({id: 6842981})
/* {
  readonly response: Response;
  filename: string;
  getFile(): Promise<File>;
} */
```

Show current page

```ts
const res = await ruTracker.view({id: 6842981})
/* {
  readonly response: Response;
  id: number;
  size: number | null;
  magnet: MagnetURL | null;
} */
```
