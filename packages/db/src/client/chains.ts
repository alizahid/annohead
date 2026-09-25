import { and, asc, count, eq, exists, inArray } from 'drizzle-orm'

import { db } from '../db'
import { type ChainType, chainTypeValues, type Lang } from '../enums'
import {
  building,
  dlc,
  factory,
  productionChain,
  productionChainCategory,
  productionChainNode,
  region,
} from '../schema'
import {
  type Get,
  groupBy,
  localized,
  on,
  type Page,
  paginate,
  regionColumns,
} from './shared'
export type ChainFilter = {
  lang: Lang
  regions?: Array<number>
  /** DLC guids (of the chain's final building) */
  dlcs?: Array<number>
  /** population_level guids whose construction menu lists the chain */
  tiers?: Array<number>
  types?: Array<ChainType>
}

const typeNames: Record<Lang, Record<ChainType, string>> = {
  de: {
    Consumer: 'Verbrauchsgüter',
    Harbour: 'Hafen',
    Material: 'Baumaterial',
    Military: 'Militär',
  },
  en: {
    Consumer: 'Consumer Goods',
    Harbour: 'Harbour',
    Material: 'Materials',
    Military: 'Military',
  },
}

/** Construction-menu tab icons; consumer chains live on per-tier tabs, so they borrow a need category's. */
const typeIcons: Record<ChainType, string> = {
  Consumer:
    'data/ui/fhd/base/icon_content/need_categories/icon_3d_need_category_household.png',
  Harbour:
    'data/ui/fhd/base/icon_content/building/icon_3d_construction_category_harbour.png',
  Material:
    'data/ui/fhd/base/icon_content/building/icon_3d_construction_category_materials.png',
  Military:
    'data/ui/fhd/base/icon_content/building/icon_3d_construction_category_military.png',
}

function types({ lang }: { lang: Lang }) {
  return chainTypeValues.map((key) => ({
    icon: typeIcons[key],
    key,
    name: typeNames[lang][key],
  }))
}

function inCategory(
  column:
    | typeof productionChainCategory.type
    | typeof productionChainCategory.populationLevelGuid,
  values: Array<ChainType> | Array<number>,
) {
  return exists(
    db
      .select({ chainGuid: productionChainCategory.chainGuid })
      .from(productionChainCategory)
      .where(
        and(
          eq(productionChainCategory.chainGuid, productionChain.guid),
          inArray(column, values),
        ),
      ),
  )
}

/** Production chains with their nodes as a flat parent/tier list. */
async function queryChains(f: ChainFilter & Page, id?: number) {
  const nameT = localized('name')
  const bName = localized('b_name')
  const nName = localized('n_name')
  const dlcT = localized('dlc_name')
  const where = and(
    id === undefined ? undefined : eq(productionChain.guid, id),
    f.regions?.length
      ? inArray(productionChain.regionId, f.regions)
      : undefined,
    f.dlcs?.length ? inArray(building.dlcGuid, f.dlcs) : undefined,
    f.tiers?.length
      ? inCategory(productionChainCategory.populationLevelGuid, f.tiers)
      : undefined,
    f.types?.length
      ? inCategory(productionChainCategory.type, f.types)
      : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({
        total: count(),
      })
      .from(productionChain)
      .leftJoin(building, eq(building.guid, productionChain.buildingGuid))
      .where(where),
    db
      .select({
        building: {
          baseProductivity: factory.baseProductivity,
          cycleTime: factory.cycleTime,
          guid: building.guid,
          icon: building.icon,
          name: bName.value,
        },
        dlc: {
          guid: dlc.guid,
          icon: dlc.icon,
          key: dlc.key,
          name: dlcT.value,
        },
        guid: productionChain.guid,
        icon: productionChain.icon,
        name: nameT.value,
        region: regionColumns,
      })
      .from(productionChain)
      .leftJoin(nameT, on(nameT, productionChain.nameText, f.lang))
      .leftJoin(region, eq(region.id, productionChain.regionId))
      .leftJoin(building, eq(building.guid, productionChain.buildingGuid))
      .leftJoin(bName, on(bName, building.nameText, f.lang))
      .leftJoin(factory, eq(factory.buildingGuid, building.guid))
      .leftJoin(dlc, eq(dlc.guid, building.dlcGuid))
      .leftJoin(dlcT, on(dlcT, dlc.nameText, f.lang))
      .where(where)
      .orderBy(asc(nameT.value), asc(productionChain.guid))
      .limit(limit)
      .offset(offset),
  ])
  const guids = rows.map((r) => r.guid)
  const nodes = await db
    .select({
      baseProductivity: factory.baseProductivity,
      chainGuid: productionChainNode.chainGuid,
      cycleTime: factory.cycleTime,
      guid: building.guid,
      icon: building.icon,
      id: productionChainNode.id,
      name: nName.value,
      needsFuel: factory.needsFuel,
      parentId: productionChainNode.parentId,
      region: regionColumns,
      tier: productionChainNode.tier,
    })
    .from(productionChainNode)
    .innerJoin(building, eq(building.guid, productionChainNode.buildingGuid))
    .leftJoin(nName, on(nName, building.nameText, f.lang))
    .leftJoin(region, eq(region.id, building.regionId))
    .leftJoin(factory, eq(factory.buildingGuid, building.guid))
    .where(inArray(productionChainNode.chainGuid, guids))
    .orderBy(asc(productionChainNode.tier), asc(productionChainNode.id))
  const n = groupBy(nodes, 'chainGuid')
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((c) => ({
      ...c,
      dlc: c.dlc?.guid ? c.dlc : null,
      nodes: n(c.guid),
    })),
    total,
  }
}

async function get({ id, lang }: Get) {
  return (
    (
      await queryChains(
        {
          lang,
          perPage: 1,
        },
        id,
      )
    ).rows[0] ?? null
  )
}

async function list(f: ChainFilter & Page) {
  return await queryChains(f)
}

export const chains = {
  get,
  list,
  types,
}
