import { and, asc, count, eq, inArray, like } from 'drizzle-orm'

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
  guid?: number
  search?: string
  regionId?: number
}

/** Production chains with their nodes as a flat parent/tier list. */
async function list(f: ChainFilter & Page) {
  const nameT = localized('name')
  const bName = localized('b_name')
  const nName = localized('n_name')
  const dlcT = localized('dlc_name')
  const where = and(
    f.guid ? eq(productionChain.guid, f.guid) : undefined,
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.regionId ? eq(productionChain.regionId, f.regionId) : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({
        total: count(),
      })
      .from(productionChain)
      .leftJoin(nameT, on(nameT, productionChain.nameText, f.lang))
      .where(where),
    db
      .select({
        building: {
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
      chainGuid: productionChainNode.chainGuid,
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
      await list({
        guid: id,
        lang,
      })
    ).rows[0] ?? null
  )
}

export const chains = {
  get,
  list,
}
