import { and, asc, count, eq, inArray, like } from 'drizzle-orm'

import { db } from '../db'
import { type Lang } from '../enums'
import { building, product, tech, techResource, techUnlock } from '../schema'
import { type Get, groupBy, localized, on, type Page, paginate } from './shared'
export type TechFilter = { lang: Lang; guid?: number; search?: string }

/** Techs with the buildings they unlock and the resources they cost. */
async function list(f: TechFilter & Page) {
  const nameT = localized('name')
  const descT = localized('desc')
  const bName = localized('b_name')
  const pName = localized('p_name')
  const where = and(
    f.guid ? eq(tech.guid, f.guid) : undefined,
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({ total: count() })
      .from(tech)
      .leftJoin(nameT, on(nameT, tech.nameText, f.lang))
      .where(where),
    db
      .select({
        description: descT.value,
        gridX: tech.gridX,
        gridY: tech.gridY,
        guid: tech.guid,
        icon: tech.icon,
        isGate: tech.isGate,
        knowledgeNeeded: tech.knowledgeNeeded,
        name: nameT.value,
      })
      .from(tech)
      .leftJoin(nameT, on(nameT, tech.nameText, f.lang))
      .leftJoin(descT, on(descT, tech.descriptionText, f.lang))
      .where(where)
      .orderBy(asc(tech.knowledgeNeeded), asc(tech.guid))
      .limit(limit)
      .offset(offset),
  ])
  const guids = rows.map((r) => r.guid)
  const [unlocks, resources] = await Promise.all([
    db
      .select({
        guid: building.guid,
        icon: building.icon,
        name: bName.value,
        techGuid: techUnlock.techGuid,
      })
      .from(techUnlock)
      .innerJoin(building, eq(building.guid, techUnlock.assetGuid))
      .leftJoin(bName, on(bName, building.nameText, f.lang))
      .where(inArray(techUnlock.techGuid, guids)),
    db
      .select({
        amount: techResource.amount,
        guid: product.guid,
        icon: product.icon,
        name: pName.value,
        techGuid: techResource.techGuid,
      })
      .from(techResource)
      .innerJoin(product, eq(product.guid, techResource.productGuid))
      .leftJoin(pName, on(pName, product.nameText, f.lang))
      .where(inArray(techResource.techGuid, guids)),
  ])
  const u = groupBy(unlocks, 'techGuid')
  const res = groupBy(resources, 'techGuid')
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((t) => ({
      ...t,
      resources: res(t.guid),
      unlocksBuildings: u(t.guid),
    })),
    total,
  }
}

async function get({ id, lang }: Get) {
  return (await list({ guid: id, lang })).rows[0] ?? null
}

export const techs = { get, list }
