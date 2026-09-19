import {
  and,
  asc,
  count,
  eq,
  exists,
  inArray,
  like,
  type SQL,
  sql,
} from 'drizzle-orm'

import { db } from '../db'
import {
  type Allocation,
  type Attribute,
  type ItemType,
  type Lang,
  type Niche,
  type Rarity,
} from '../enums'
import {
  attribute,
  buff,
  buffModifier,
  building,
  effect,
  effectBuff,
  effectTargetPool,
  item,
  itemBoostBuff,
  itemSource,
  poolMember,
} from '../schema'
import {
  type Get,
  groupBy,
  localized,
  modifierColumns,
  on,
  type Page,
  paginate,
} from './shared'
export type ItemFilter = {
  lang: Lang
  guid?: number
  search?: string
  rarity?: Array<Rarity>
  niche?: Array<Niche>
  type?: ItemType
  allocation?: Allocation
  /** building guid the item's effect targets */
  targetBuilding?: number
  /** attribute key (Money, Knowledge …) the item's effect modifies */
  attribute?: Attribute
}

function itemWhere(
  f: ItemFilter,
  nameT: ReturnType<typeof localized>,
): SQL | undefined {
  return and(
    f.guid ? eq(item.guid, f.guid) : undefined,
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.rarity?.length ? inArray(item.rarity, f.rarity) : undefined,
    f.niche?.length ? inArray(item.niche, f.niche) : undefined,
    f.type ? eq(item.type, f.type) : undefined,
    f.allocation ? eq(item.allocation, f.allocation) : undefined,
    f.targetBuilding
      ? exists(
          db
            .select({
              one: sql`1`,
            })
            .from(effectTargetPool)
            .innerJoin(
              poolMember,
              eq(poolMember.poolGuid, effectTargetPool.poolGuid),
            )
            .where(
              and(
                eq(effectTargetPool.effectGuid, item.effectGuid),
                eq(poolMember.assetGuid, f.targetBuilding),
              ),
            ),
        )
      : undefined,
    f.attribute
      ? exists(
          db
            .select({
              one: sql`1`,
            })
            .from(effectBuff)
            .innerJoin(
              buffModifier,
              eq(buffModifier.buffGuid, effectBuff.buffGuid),
            )
            .innerJoin(attribute, eq(attribute.id, buffModifier.attributeId))
            .where(
              and(
                eq(effectBuff.effectGuid, item.effectGuid),
                eq(attribute.key, f.attribute),
              ),
            ),
        )
      : undefined,
  )
}

async function itemDetails(guids: Array<number>, lang: Lang) {
  const bName = localized('b_name')
  const [targets, modifiers, boosts, sources] = await Promise.all([
    db
      .selectDistinct({
        guid: building.guid,
        icon: building.icon,
        itemGuid: item.guid,
        kind: building.kind,
        name: bName.value,
      })
      .from(item)
      .innerJoin(
        effectTargetPool,
        eq(effectTargetPool.effectGuid, item.effectGuid),
      )
      .innerJoin(poolMember, eq(poolMember.poolGuid, effectTargetPool.poolGuid))
      .innerJoin(building, eq(building.guid, poolMember.assetGuid))
      .leftJoin(bName, on(bName, building.nameText, lang))
      .where(inArray(item.guid, guids)),
    db
      .select({
        itemGuid: item.guid,
        ...modifierColumns,
      })
      .from(item)
      .innerJoin(effectBuff, eq(effectBuff.effectGuid, item.effectGuid))
      .innerJoin(buff, eq(buff.guid, effectBuff.buffGuid))
      .innerJoin(buffModifier, eq(buffModifier.buffGuid, buff.guid))
      .leftJoin(attribute, eq(attribute.id, buffModifier.attributeId))
      .where(inArray(item.guid, guids)),
    db
      .select({
        itemGuid: itemBoostBuff.itemGuid,
        ...modifierColumns,
      })
      .from(itemBoostBuff)
      .innerJoin(buff, eq(buff.guid, itemBoostBuff.buffGuid))
      .innerJoin(buffModifier, eq(buffModifier.buffGuid, buff.guid))
      .leftJoin(attribute, eq(attribute.id, buffModifier.attributeId))
      .where(inArray(itemBoostBuff.itemGuid, guids)),
    db
      .select({
        guid: itemSource.sourceGuid,
        itemGuid: itemSource.itemGuid,
        kind: itemSource.sourceKind,
      })
      .from(itemSource)
      .where(inArray(itemSource.itemGuid, guids)),
  ])
  return {
    boosts: groupBy(boosts, 'itemGuid'),
    modifiers: groupBy(modifiers, 'itemGuid'),
    sources: groupBy(sources, 'itemGuid'),
    targets: groupBy(targets, 'itemGuid'),
  }
}

/** Specialists, captains and quest items with effect targets, modifiers, boosts and sources. */
async function list(f: ItemFilter & Page) {
  const nameT = localized('name')
  const descT = localized('desc')
  const hintT = localized('hint')
  const where = itemWhere(f, nameT)
  const { limit, offset } = paginate(f)

  const [[{ total }], rows] = await Promise.all([
    db
      .select({
        total: count(),
      })
      .from(item)
      .leftJoin(nameT, on(nameT, item.nameText, f.lang))
      .where(where),
    db
      .select({
        allocation: item.allocation,
        boostHint: hintT.value,
        description: descT.value,
        effectScope: effect.scope,
        guid: item.guid,
        icon: item.icon,
        name: nameT.value,
        niche: item.niche,
        rarity: item.rarity,
        tradePrice: item.tradePrice,
        type: item.type,
      })
      .from(item)
      .leftJoin(nameT, on(nameT, item.nameText, f.lang))
      .leftJoin(descT, on(descT, item.descriptionText, f.lang))
      .leftJoin(hintT, on(hintT, item.boostHintText, f.lang))
      .leftJoin(effect, eq(effect.guid, item.effectGuid))
      .where(where)
      .orderBy(asc(nameT.value), asc(item.guid))
      .limit(limit)
      .offset(offset),
  ])
  const d = await itemDetails(
    rows.map((r) => r.guid),
    f.lang,
  )
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((r) => ({
      ...r,
      boosts: d.boosts(r.guid),
      modifiers: d.modifiers(r.guid),
      sources: d.sources(r.guid),
      targets: d.targets(r.guid),
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

function listSpecialists(f: Omit<ItemFilter, 'type'> & Page) {
  return list({
    ...f,
    type: 'Specialist',
  })
}

function listCaptains(f: Omit<ItemFilter, 'type'> & Page) {
  return list({
    ...f,
    type: 'Captains',
  })
}

export const items = {
  get,
  list,
}
export const specialists = {
  get,
  list: listSpecialists,
}
export const captains = {
  get,
  list: listCaptains,
}
