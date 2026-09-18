// Pushes searchable entities (buildings, items, products, techs, quests, chains) to Algolia.
// Run via `bun run algolia` at the root (regenerates the db first) or `bun algolia.ts` here.

import { algoliasearch } from 'algoliasearch'
import { type SQLiteColumn } from 'drizzle-orm/sqlite-core'

import {
  building,
  buildingRegion,
  db,
  eq,
  item,
  product,
  productionChain,
  quest,
  region,
  sql,
  tech,
} from './src'
import { localized, on } from './src/client/shared'
import {
  buildingKindValues,
  itemTypeValues,
  type Lang,
  langValues,
  questCategoryValues,
  type Region,
  regionValues,
} from './src/enums'
import { type SearchRecord, type SearchType } from './src/search'

type Source = {
  type: SearchType
  table:
    | typeof building
    | typeof item
    | typeof product
    | typeof tech
    | typeof quest
    | typeof productionChain
  category?: SQLiteColumn
  description?: SQLiteColumn
}

const sources: Array<Source> = [
  {
    category: building.kind,
    description: building.descriptionText,
    table: building,
    type: 'building',
  },
  {
    category: item.itemType,
    description: item.descriptionText,
    table: item,
    type: 'item',
  },
  { table: product, type: 'product' },
  { description: tech.descriptionText, table: tech, type: 'tech' },
  {
    category: quest.category,
    description: quest.summaryText,
    table: quest,
    type: 'quest',
  },
  { table: productionChain, type: 'chain' },
]

// translation line ids are 64-bit hashes, so they must be joined in sql and never read into js
async function load(
  { category, description, table, type }: Source,
  lang: Lang,
) {
  const nameT = localized('name')
  const descT = localized('desc')
  return await db
    .select({
      category: category ?? sql<null>`null`,
      description: descT.value,
      guid: table.guid,
      icon: table.icon,
      name: nameT.value,
    })
    .from(table)
    .leftJoin(nameT, on(nameT, table.nameText, lang))
    .leftJoin(descT, description ? on(descT, description, lang) : sql`0`)
    .then((rows) => rows.map((row) => ({ ...row, lang, type })))
}

function pick<T extends string>(values: ReadonlyArray<T>, value: unknown): T {
  if (!values.includes(value as T)) {
    throw new Error(`unexpected value ${String(value)}`)
  }
  return value as T
}

async function buildingRegions() {
  const rows = await db
    .select({ guid: buildingRegion.buildingGuid, name: region.name })
    .from(buildingRegion)
    .innerJoin(region, eq(region.id, buildingRegion.regionId))
  const map = new Map<number, Array<Region>>()
  for (const row of rows) {
    if (row.guid !== null) {
      map.set(row.guid, [
        ...(map.get(row.guid) ?? []),
        pick(regionValues, row.name),
      ])
    }
  }
  return map
}

type Row = Awaited<ReturnType<typeof load>>[number] & { guid: number }

function create(row: Row, regions: Map<number, Array<Region>>): SearchRecord {
  const base = {
    description: {},
    guid: row.guid,
    icon: row.icon,
    name: {},
  }
  switch (row.type) {
    case 'building':
      return {
        ...base,
        category: pick(buildingKindValues, row.category),
        objectID: `building_${row.guid}`,
        regions: regions.get(row.guid) ?? [],
        type: 'building',
      }
    case 'item':
      return {
        ...base,
        category: pick(itemTypeValues, row.category),
        objectID: `item_${row.guid}`,
        type: 'item',
      }
    case 'quest':
      return {
        ...base,
        category: pick(questCategoryValues, row.category),
        objectID: `quest_${row.guid}`,
        type: 'quest',
      }
    case 'product':
      return { ...base, objectID: `product_${row.guid}`, type: 'product' }
    case 'tech':
      return { ...base, objectID: `tech_${row.guid}`, type: 'tech' }
    case 'chain':
      return { ...base, objectID: `chain_${row.guid}`, type: 'chain' }
    default:
      throw new Error(`unknown type ${row.type satisfies never}`)
  }
}

export async function records(): Promise<Array<SearchRecord>> {
  const byId = new Map<string, SearchRecord>()
  const [regions, ...rows] = await Promise.all([
    buildingRegions(),
    ...sources.flatMap((source) =>
      langValues.map((lang) => load(source, lang)),
    ),
  ])
  for (const row of rows.flat()) {
    if (row.guid === null) {
      continue
    }
    const objectID = `${row.type}_${row.guid}`
    const record =
      byId.get(objectID) ?? create({ ...row, guid: row.guid }, regions)
    if (row.name) {
      record.name[row.lang] = row.name
    }
    if (row.description) {
      record.description[row.lang] = row.description
    }
    byId.set(objectID, record)
  }
  return [...byId.values()].filter((r) => r.name.en)
}

function env(key: string) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}

async function main() {
  const client = algoliasearch(env('ALGOLIA_APP_ID'), env('ALGOLIA_ADMIN_KEY'))
  const indexName = process.env.ALGOLIA_INDEX ?? 'anno'
  const objects = await records()
  await client.setSettings({
    indexName,
    indexSettings: {
      attributesForFaceting: ['type', 'category', 'regions'],
      searchableAttributes: [
        'name.en',
        'name.de',
        'description.en',
        'description.de',
      ],
    },
  })
  await client.replaceAllObjects({ indexName, objects })
  process.stdout.write(`indexed ${objects.length} records to ${indexName}\n`)
}

if (import.meta.main) {
  await main()
}
