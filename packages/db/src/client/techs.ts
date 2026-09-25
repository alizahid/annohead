import { and, asc, eq, inArray, like } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'

import { db } from '../db'
import { type Lang } from '../enums'
import {
  assetPool,
  attribute,
  buff,
  buffFunctionalEffect,
  buffModifier,
  building,
  effect,
  effectBuff,
  effectTargetPool,
  product,
  tech,
  techCategory,
  techEffect,
  techResource,
  techUnlockReward,
} from '../schema'
import { modifierName } from './modifier-labels'
import { type Get, groupBy, localized, modifierColumns, on } from './shared'

export type TechFilter = {
  lang: Lang
  search?: string
}

/** Techs with what they unlock, their effects and the resources they grant. */
async function queryTechs(f: TechFilter, guid?: number) {
  const nameT = localized('name')
  const descT = localized('desc')
  const pName = localized('p_name')
  const where = and(
    guid ? eq(tech.guid, guid) : undefined,
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
  )
  const rows = await db
    .select({
      categoryGuid: tech.categoryGuid,
      description: descT.value,
      gridX: tech.gridX,
      gridY: tech.gridY,
      guid: tech.guid,
      icon: tech.icon,
      image: tech.image,
      isGate: tech.isGate,
      knowledgeNeeded: tech.knowledgeNeeded,
      name: nameT.value,
      showConnectionToCategory: tech.showConnectionToCategory,
    })
    .from(tech)
    .leftJoin(nameT, on(nameT, tech.nameText, f.lang))
    .leftJoin(descT, on(descT, tech.descriptionText, f.lang))
    .where(where)
    .orderBy(asc(tech.knowledgeNeeded), asc(tech.guid))
  const guids = rows.map((r) => r.guid)
  const rName = localized('r_name')
  const eName = localized('e_name')
  const eDesc = localized('e_desc')
  const uDesc = localized('u_desc')
  const ubCategory = localized('ub_category')
  const tName = localized('t_name')
  const mpName = localized('mp_name')
  // a buff can give its building a functional effect whose own buffs apply to buildings near it (e.g. Custodes +1 Happiness)
  const nearbyBuff = alias(effectBuff, 'nearby_buff')
  const [
    resources,
    unlocks,
    effects,
    effectTargets,
    effectModifiers,
    nearbyModifiers,
  ] = await Promise.all([
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
    db
      .select({
        /** the building the game describes this entry with; null for upgrades, units, goods … */
        buildingGuid: techUnlockReward.buildingGuid,
        category: ubCategory.value,
        description: uDesc.value,
        guid: techUnlockReward.assetGuid,
        icon: techUnlockReward.icon,
        idx: techUnlockReward.idx,
        name: rName.value,
        techGuid: techUnlockReward.techGuid,
      })
      .from(techUnlockReward)
      .leftJoin(rName, on(rName, techUnlockReward.nameText, f.lang))
      .leftJoin(uDesc, on(uDesc, techUnlockReward.descriptionText, f.lang))
      .leftJoin(building, eq(building.guid, techUnlockReward.buildingGuid))
      .leftJoin(ubCategory, on(ubCategory, building.categoryText, f.lang))
      .where(inArray(techUnlockReward.techGuid, guids))
      .orderBy(asc(techUnlockReward.idx)),
    db
      .select({
        description: eDesc.value,
        guid: effect.guid,
        name: eName.value,
        techGuid: techEffect.techGuid,
      })
      .from(techEffect)
      .innerJoin(effect, eq(effect.guid, techEffect.effectGuid))
      .leftJoin(eName, on(eName, effect.nameText, f.lang))
      .leftJoin(eDesc, on(eDesc, effect.descriptionText, f.lang))
      .where(inArray(techEffect.techGuid, guids)),
    db
      .selectDistinct({
        effectGuid: effectTargetPool.effectGuid,
        guid: assetPool.guid,
        name: tName.value,
      })
      .from(techEffect)
      .innerJoin(
        effectTargetPool,
        eq(effectTargetPool.effectGuid, techEffect.effectGuid),
      )
      .innerJoin(assetPool, eq(assetPool.guid, effectTargetPool.poolGuid))
      .leftJoin(tName, on(tName, assetPool.nameText, f.lang))
      .where(inArray(techEffect.techGuid, guids)),
    db
      .selectDistinct({
        effectGuid: effectBuff.effectGuid,
        ...modifierColumns,
        productIcon: product.icon,
        productName: mpName.value,
      })
      .from(techEffect)
      .innerJoin(effectBuff, eq(effectBuff.effectGuid, techEffect.effectGuid))
      .innerJoin(buff, eq(buff.guid, effectBuff.buffGuid))
      .innerJoin(buffModifier, eq(buffModifier.buffGuid, buff.guid))
      .leftJoin(attribute, eq(attribute.id, buffModifier.attributeId))
      .leftJoin(product, eq(product.guid, buffModifier.productGuid))
      .leftJoin(mpName, on(mpName, product.nameText, f.lang))
      .where(inArray(techEffect.techGuid, guids)),
    db
      .selectDistinct({
        effectGuid: effectBuff.effectGuid,
        ...modifierColumns,
        productIcon: product.icon,
        productName: mpName.value,
      })
      .from(techEffect)
      .innerJoin(effectBuff, eq(effectBuff.effectGuid, techEffect.effectGuid))
      .innerJoin(
        buffFunctionalEffect,
        eq(buffFunctionalEffect.buffGuid, effectBuff.buffGuid),
      )
      .innerJoin(
        nearbyBuff,
        eq(nearbyBuff.effectGuid, buffFunctionalEffect.effectGuid),
      )
      .innerJoin(buff, eq(buff.guid, nearbyBuff.buffGuid))
      .innerJoin(buffModifier, eq(buffModifier.buffGuid, buff.guid))
      .leftJoin(attribute, eq(attribute.id, buffModifier.attributeId))
      .leftJoin(product, eq(product.guid, buffModifier.productGuid))
      .leftJoin(mpName, on(mpName, product.nameText, f.lang))
      .where(inArray(techEffect.techGuid, guids)),
  ])
  const res = groupBy(resources, 'techGuid')
  const unl = groupBy(unlocks, 'techGuid')
  const eff = groupBy(effects, 'techGuid')
  const targets = groupBy(effectTargets, 'effectGuid')
  const modifiers = groupBy(
    [
      ...effectModifiers.map((m) => ({
        ...m,
        nearby: false,
      })),
      ...nearbyModifiers.map((m) => ({
        ...m,
        /** applies to buildings near the targets, not to the targets themselves */
        nearby: true,
      })),
    ],
    'effectGuid',
  )
  return rows.map((t) => ({
    ...t,
    effects: eff(t.guid).map((e) => ({
      ...e,
      modifiers: modifiers(e.guid).map((m) => ({
        ...m,
        name: modifierName(m.path, m.attribute, f.lang),
      })),
      /** what the effect applies to, e.g. "Warehouses" */
      targets: targets(e.guid),
    })),
    resources: res(t.guid),
    /** what the game lists under "Unlocks", e.g. "Warehouse Upgrade" or "Stone Walls" */
    unlocks: unl(t.guid),
  }))
}

async function get({ id, lang }: Get) {
  return (await queryTechs({ lang }, id))[0] ?? null
}

async function list(f: TechFilter) {
  return await queryTechs(f)
}

/** Tech tree hubs; `x`/`y` place the hub, techs sit on a hex grid relative to it. */
async function categories({ lang }: { lang: Lang }) {
  const nameT = localized('name')
  const descT = localized('desc')
  const gate = alias(tech, 'gate')
  const gateNameT = localized('gate_name')
  const gateDescT = localized('gate_desc')
  return await db
    .select({
      artwork: techCategory.artwork,
      description: descT.value,
      /** the opening gate: its name titles the category and its description is the requirement */
      gate: {
        description: gateDescT.value,
        guid: gate.guid,
        name: gateNameT.value,
      },
      guid: techCategory.guid,
      icon: techCategory.icon,
      name: nameT.value,
      type: techCategory.type,
      x: techCategory.x,
      y: techCategory.y,
    })
    .from(techCategory)
    .leftJoin(nameT, on(nameT, techCategory.nameText, lang))
    .leftJoin(descT, on(descT, techCategory.descriptionText, lang))
    .leftJoin(gate, eq(gate.guid, techCategory.gateGuid))
    .leftJoin(gateNameT, on(gateNameT, gate.nameText, lang))
    .leftJoin(gateDescT, on(gateDescT, gate.descriptionText, lang))
    .orderBy(asc(techCategory.sort))
}

export const techs = {
  categories,
  get,
  list,
}
