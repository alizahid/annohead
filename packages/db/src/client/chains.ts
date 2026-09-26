import { and, asc, count, eq, inArray } from 'drizzle-orm'

import { db } from '../db'
import { type Lang } from '../enums'
import {
  building,
  dlc,
  factory,
  productionChain,
  productionChainNode,
  region,
} from '../schema'
import {
  categoriesOf,
  type Get,
  groupBy,
  inCategories,
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
  /** construction-menu tabs listing the chain (category guids, see `chains.types`): a tier's tab, Materials … */
  types?: Array<number>
}

/** The construction-menu tabs chains are filed under, in game order. */
async function types({ lang }: { lang: Lang }) {
  return await categoriesOf('menu', productionChain.guid, lang)
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
    f.types?.length ? inCategories(productionChain.guid, f.types) : undefined,
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
        slug: productionChain.slug,
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
      slug: building.slug,
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
