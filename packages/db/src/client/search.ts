import { type SQL, sql } from 'drizzle-orm'
import { type SQLiteColumn, type SQLiteTable } from 'drizzle-orm/sqlite-core'

import { db } from '../db'
import {
  type BuildingKind,
  type ItemType,
  type Lang,
  type QuestCategory,
  type Rarity,
  type Region,
  regionValues,
} from '../enums'
import {
  building,
  item,
  product,
  productionChain,
  quest,
  tech,
} from '../schema'
import { type SearchType } from '../search'
import { langId, type Page, paginate } from './shared'

export type SearchFilter = {
  lang: Lang
  query: string
  types?: Array<SearchType>
}

export type SearchHit = {
  type: SearchType
  guid: number
  icon: string | null
  name: string
  description: string | null
  /** building kind, item type or quest category */
  category: BuildingKind | ItemType | QuestCategory | null
  /** Item rarity; null for other entity types. */
  rarity: Rarity | null
  /** set for buildings and chains */
  regions: Array<Region>
}

type Source = {
  type: SearchType
  table: SQLiteTable
  guid: SQLiteColumn
  icon: SQLiteColumn
  name: SQLiteColumn
  description?: SQLiteColumn
  category?: SQLiteColumn
  rarity?: SQLiteColumn
  /** comma separated region keys */
  regions?: SQL
}

const sources: Array<Source> = [
  {
    category: building.kind,
    description: building.descriptionText,
    guid: building.guid,
    icon: building.icon,
    name: building.nameText,
    regions: sql`(select group_concat(key) from (select r.key from building_region br join region r on r.id = br.region_id where br.building_guid = ${building.guid} order by r.id))`,
    table: building,
    type: 'building',
  },
  {
    category: item.type,
    description: item.descriptionText,
    guid: item.guid,
    icon: item.icon,
    name: item.nameText,
    rarity: item.rarity,
    table: item,
    type: 'item',
  },
  {
    guid: product.guid,
    icon: product.icon,
    name: product.nameText,
    table: product,
    type: 'product',
  },
  {
    description: tech.descriptionText,
    guid: tech.guid,
    icon: tech.icon,
    name: tech.nameText,
    table: tech,
    type: 'tech',
  },
  {
    category: quest.category,
    description: quest.summaryText,
    guid: quest.guid,
    icon: quest.icon,
    name: quest.nameText,
    table: quest,
    type: 'quest',
  },
  {
    guid: productionChain.guid,
    icon: productionChain.icon,
    name: productionChain.nameText,
    regions: sql`(select key from region where id = ${productionChain.regionId})`,
    table: productionChain,
    type: 'chain',
  },
]

function select(s: Source, lang: Lang) {
  const none = sql`null`
  return sql`select ${s.type} as type, ${s.guid} as guid, ${s.icon} as icon, n.value as name, d.value as description, ${s.category ?? none} as category, ${s.rarity ?? none} as rarity, ${s.regions ?? none} as regions
    from ${s.table}
    join translation n on n.line_id = ${s.name} and n.lang_id = ${langId(lang)}
    left join translation d on d.line_id = ${s.description ?? none} and d.lang_id = ${langId(lang)}`
}

type Row = Omit<SearchHit, 'regions'> & {
  regions: string | null
}

/** Every searchable row in one language; variants that read the same (Infantry Camp ×2) collapse to the lowest guid. */
function load(lang: Lang, types?: Array<SearchType>) {
  const filter = types?.length
    ? sql`where type in (${sql.join(
        types.map((t) => sql`${t}`),
        sql`, `,
      )})`
    : sql``
  return db.all<Row>(
    sql`select type, min(guid) as guid, icon, name, description, category, rarity, regions
      from (${sql.join(
        sources.map((s) => select(s, lang)),
        sql` union all `,
      )}) ${filter}
      group by type, name, description, category, rarity, regions`,
  )
}

const DIACRITICS = /\p{M}/gu
const WORD_BREAK = /[^\p{L}\p{N}]+/u
/** no typos in short words, one from 4 characters, two from 8 */
const ONE_TYPO_LENGTH = 4
const TWO_TYPOS_LENGTH = 8

/** lowercase without diacritics, so "backerei" and "BÄCKEREI" both find Bäckerei */
function fold(text: string) {
  return text
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replaceAll('ß', 'ss')
}

function words(text: string) {
  return text.split(WORD_BREAK).filter(Boolean)
}

function typosAllowed(length: number) {
  if (length < ONE_TYPO_LENGTH) {
    return 0
  }
  return length < TWO_TYPOS_LENGTH ? 1 : 2
}

/** Optimal string alignment distance: insertions, deletions, substitutions and adjacent swaps. */
function distance(a: string, b: string) {
  let beforePrevious: Array<number> = []
  let previous = Array.from(
    {
      length: b.length + 1,
    },
    (_, j) => j,
  )
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let best = Math.min(
        (previous[j] ?? 0) + 1,
        (current[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + cost,
      )
      const swapped =
        i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]
      if (swapped) {
        best = Math.min(best, (beforePrevious[j - 2] ?? 0) + 1)
      }
      current.push(best)
    }
    beforePrevious = previous
    previous = current
  }
  return previous[b.length] ?? 0
}

/** Typos needed for every query word to match a name word or the start of one; null when over budget. */
function fuzzy(tokens: Array<string>, nameWords: Array<string>) {
  let total = 0
  for (const token of tokens) {
    const best = Math.min(
      ...nameWords.map((word) =>
        Math.min(
          distance(token, word),
          distance(token, word.slice(0, token.length)),
        ),
      ),
    )
    if (best > typosAllowed(token.length)) {
      return null
    }
    total += best
  }
  return total
}

const Tier = {
  Contains: 3,
  Description: 5,
  Exact: 0,
  Fuzzy: 4,
  Prefix: 1,
  WordPrefix: 2,
} as const

/** [tier, typos] for a row, lower is better; null when it does not match */
function score(row: Row, query: string, tokens: Array<string>) {
  const name = fold(row.name)
  if (name === query) {
    return [Tier.Exact, 0] as const
  }
  if (name.startsWith(query)) {
    return [Tier.Prefix, 0] as const
  }
  const nameWords = words(name)
  if (tokens.every((t) => nameWords.some((w) => w.startsWith(t)))) {
    return [Tier.WordPrefix, 0] as const
  }
  if (name.includes(query)) {
    return [Tier.Contains, 0] as const
  }
  const typos = fuzzy(tokens, nameWords)
  if (typos !== null) {
    return [Tier.Fuzzy, typos] as const
  }
  const description = fold(row.description ?? '')
  if (tokens.every((t) => description.includes(t))) {
    return [Tier.Description, 0] as const
  }
  return null
}

/**
 * Searches every entity type at once. Ranked exact name, name prefix, word prefix,
 * substring, typo tolerant word match, then description; word order, case and diacritics do not matter.
 */
// ponytail: loads and scores every row of the language per query (~1.5k rows, a few ms); precompute a search table
// with fts5 trigrams in the transformer once that is too slow
async function search(f: SearchFilter & Page) {
  const query = fold(f.query.trim())
  const tokens = words(query)
  const rows = await load(f.lang, f.types)
  const hits: Array<{
    row: Row
    tier: number
    typos: number
  }> = []
  for (const row of rows) {
    const scored = tokens.length ? score(row, query, tokens) : ([0, 0] as const)
    if (scored) {
      hits.push({
        row,
        tier: scored[0],
        typos: scored[1],
      })
    }
  }
  hits.sort(
    (a, b) =>
      a.tier - b.tier ||
      a.typos - b.typos ||
      a.row.name.localeCompare(b.row.name, f.lang) ||
      a.row.guid - b.row.guid,
  )
  const { limit, offset } = paginate(f)
  return {
    pages: Math.ceil(hits.length / limit),
    rows: hits
      .slice(offset, offset + limit)
      .map(({ row: { regions, ...row } }): SearchHit => {
        const keys = regions?.split(',') ?? []
        return {
          ...row,
          regions: regionValues.filter((r) => keys.includes(r)),
        }
      }),
    total: hits.length,
  }
}

export { search }
