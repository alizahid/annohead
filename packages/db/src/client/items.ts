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
  type BuildingCategory,
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
  dlc,
  effect,
  effectBuff,
  effectTargetPool,
  item,
  itemBoostBuff,
  itemSource,
  poolMember,
} from '../schema'
import {
  allocations,
  nicheLabel,
  niches,
  rarities,
  rarityLabel,
  typeLabel,
  types,
} from './item-labels'
import {
  categoryIn,
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
  search?: string
  rarities?: Array<Rarity>
  niches?: Array<Niche>
  types?: Array<ItemType>
  allocations?: Array<Allocation>
  /** DLC guids */
  dlcs?: Array<number>
  /** building categories (see `buildings.categories`) the item's effect targets */
  categories?: Array<BuildingCategory>
  /** attribute keys (Money, Knowledge …) the item's effect modifies */
  attributes?: Array<Attribute>
}

function itemWhere(
  f: ItemFilter,
  nameT: ReturnType<typeof localized>,
): SQL | undefined {
  return and(
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.rarities?.length ? inArray(item.rarity, f.rarities) : undefined,
    f.niches?.length ? inArray(item.niche, f.niches) : undefined,
    f.types?.length ? inArray(item.type, f.types) : undefined,
    f.allocations?.length ? inArray(item.allocation, f.allocations) : undefined,
    f.dlcs?.length ? inArray(item.dlcGuid, f.dlcs) : undefined,
    f.categories?.length
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
            .innerJoin(building, eq(building.guid, poolMember.assetGuid))
            .where(
              and(
                eq(effectTargetPool.effectGuid, item.effectGuid),
                categoryIn(f.categories),
              ),
            ),
        )
      : undefined,
    f.attributes?.length
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
                inArray(attribute.key, f.attributes),
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
async function queryItems(f: ItemFilter & Page, id?: number) {
  const nameT = localized('name')
  const descT = localized('desc')
  const hintT = localized('hint')
  const dlcT = localized('dlc_name')
  const where = and(
    itemWhere(f, nameT),
    id === undefined ? undefined : eq(item.guid, id),
  )
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
        dlc: {
          guid: dlc.guid,
          icon: dlc.icon,
          key: dlc.key,
          name: dlcT.value,
        },
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
      .leftJoin(dlc, eq(dlc.guid, item.dlcGuid))
      .leftJoin(dlcT, on(dlcT, dlc.nameText, f.lang))
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
      dlc: r.dlc?.guid ? r.dlc : null,
      modifiers: d.modifiers(r.guid),
      niche: nicheLabel(r.niche, f.lang),
      rarity: rarityLabel(r.rarity, f.lang),
      sources: d.sources(r.guid),
      targets: d.targets(r.guid),
      type: typeLabel(r.type, f.lang),
    })),
    total,
  }
}

async function get({ id, lang }: Get) {
  return (
    (
      await queryItems(
        {
          lang,
          perPage: 1,
        },
        id,
      )
    ).rows[0] ?? null
  )
}

async function list(f: ItemFilter & Page) {
  return await queryItems(f)
}

function listSpecialists(f: Omit<ItemFilter, 'types'> & Page) {
  return list({
    ...f,
    types: ['Specialist'],
  })
}

function listCaptains(f: Omit<ItemFilter, 'types'> & Page) {
  return list({
    ...f,
    types: ['Captains'],
  })
}

export const items = {
  allocations,
  get,
  list,
  niches,
  rarities,
  types,
}
export const specialists = {
  get,
  list: listSpecialists,
}
export const captains = {
  get,
  list: listCaptains,
}
