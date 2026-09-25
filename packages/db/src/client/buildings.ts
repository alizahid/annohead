import { and, asc, count, eq, exists, inArray, like, sql } from 'drizzle-orm'

import { db } from '../db'
import {
  type BuildingCategory,
  type BuildingKind,
  type BuildingType,
  type Lang,
} from '../enums'
import {
  attribute,
  buff,
  buffModifier,
  buffProvidedNeed,
  building,
  buildingCost,
  buildingEffect,
  buildingMaintenance,
  buildingPhase,
  buildingPhaseCost,
  buildingPhaseMaintenance,
  dlc,
  effectBuff,
  factory,
  factoryInput,
  factoryOutput,
  need,
  needAttribute,
  populationLevel,
  product,
  region,
  tech,
  techUnlock,
} from '../schema'
import { attributeName } from './attribute-labels'
import { kindLabel, kinds, typeLabel, types } from './building-labels'
import {
  categoryIn,
  type Get,
  groupBy,
  localized,
  modifierColumns,
  on,
  type Page,
  paginate,
  regionColumns,
} from './shared'
import { unlockRequirements } from './unlock-requirements'
export type BuildingFilter = {
  lang: Lang
  search?: string
  kind?: Array<BuildingKind>
  type?: Array<BuildingType>
  category?: Array<BuildingCategory>
  regionId?: Array<number>
  /** DLC guids */
  dlc?: Array<number>
  /** workforce tier (population_level guid) */
  workforce?: Array<number>
}

function buildingWhere(f: BuildingFilter, nameT: ReturnType<typeof localized>) {
  return and(
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.kind?.length ? inArray(building.kind, f.kind) : undefined,
    f.type?.length ? inArray(building.type, f.type) : undefined,
    f.category?.length ? categoryIn(f.category) : undefined,
    f.regionId?.length ? inArray(building.regionId, f.regionId) : undefined,
    f.dlc?.length ? inArray(building.dlcGuid, f.dlc) : undefined,
    f.workforce?.length
      ? exists(
          db
            .select({ buildingGuid: buildingMaintenance.buildingGuid })
            .from(buildingMaintenance)
            .innerJoin(
              populationLevel,
              eq(
                populationLevel.workforceProductGuid,
                buildingMaintenance.productGuid,
              ),
            )
            .where(
              and(
                eq(buildingMaintenance.buildingGuid, building.guid),
                inArray(populationLevel.guid, f.workforce),
              ),
            ),
        )
      : undefined,
  )
}

/** `(product, amount)` rows of `table` owned by `guids`, keyed by the owner column. */
function productRows(
  table:
    | typeof factoryInput
    | typeof factoryOutput
    | typeof buildingCost
    | typeof buildingMaintenance
    | typeof buildingPhaseCost
    | typeof buildingPhaseMaintenance,
  guids: Array<number>,
  lang: Lang,
) {
  const owner = 'phaseGuid' in table ? table.phaseGuid : table.buildingGuid
  const pName = localized('p_name')
  return db
    .select({
      amount: table.amount,
      guid: product.guid,
      icon: product.icon,
      name: pName.value,
      owner,
    })
    .from(table)
    .innerJoin(product, eq(product.guid, table.productGuid))
    .leftJoin(pName, on(pName, product.nameText, lang))
    .where(inArray(owner, guids))
}

function workforceRows(guids: Array<number>, lang: Lang) {
  const nameT = localized('workforce_name')
  return db
    .select({
      amount: buildingMaintenance.amount,
      buildingGuid: buildingMaintenance.buildingGuid,
      guid: populationLevel.guid,
      icon: populationLevel.icon,
      name: nameT.value,
      tier: populationLevel.tier,
    })
    .from(buildingMaintenance)
    .innerJoin(
      populationLevel,
      eq(populationLevel.workforceProductGuid, buildingMaintenance.productGuid),
    )
    .leftJoin(nameT, on(nameT, populationLevel.nameText, lang))
    .where(inArray(buildingMaintenance.buildingGuid, guids))
    .orderBy(asc(populationLevel.tier), asc(populationLevel.guid))
}

async function phaseRows(guids: Array<number>, lang: Lang) {
  const nameT = localized('ph_name')
  const rows = await db
    .select({
      buildingGuid: buildingPhase.buildingGuid,
      durationSeconds: buildingPhase.durationSeconds,
      guid: buildingPhase.guid,
      name: nameT.value,
      phase: buildingPhase.phase,
    })
    .from(buildingPhase)
    .leftJoin(nameT, on(nameT, buildingPhase.nameText, lang))
    .where(inArray(buildingPhase.buildingGuid, guids))
    .orderBy(asc(buildingPhase.phase))
  const phaseGuids = rows.map((r) => r.guid)
  const [costs, maintenance, requirements] = await Promise.all([
    productRows(buildingPhaseCost, phaseGuids, lang),
    productRows(buildingPhaseMaintenance, phaseGuids, lang),
    unlockRequirements(phaseGuids, lang),
  ])
  const c = groupBy(costs, 'owner')
  const m = groupBy(maintenance, 'owner')
  const u = groupBy(requirements, 'assetGuid')
  return rows.map((r) => ({
    ...r,
    costs: c(r.guid),
    maintenance: m(r.guid),
    name:
      r.buildingGuid === 3621 && r.phase === 2
        ? {
            de: 'Amphitheater: Grundstruktur',
            en: 'Amphitheatre: Base Structure',
          }[lang]
        : r.name,
    unlockRequirements: u(r.guid),
  }))
}

/** Modifiers of the adjacency / service effects a building emits. */
function effectRows(guids: Array<number>) {
  return db
    .select({
      buildingGuid: buildingEffect.buildingGuid,
      ...modifierColumns,
    })
    .from(buildingEffect)
    .innerJoin(effectBuff, eq(effectBuff.effectGuid, buildingEffect.effectGuid))
    .innerJoin(buff, eq(buff.guid, effectBuff.buffGuid))
    .innerJoin(buffModifier, eq(buffModifier.buffGuid, buff.guid))
    .leftJoin(attribute, eq(attribute.id, buffModifier.attributeId))
    .where(inArray(buildingEffect.buildingGuid, guids))
}

/** Need fulfilment: residence attributes granted by a building's service. */
function buffRows(guids: Array<number>) {
  return db
    .select({
      attribute: attribute.key,
      buildingGuid: buildingEffect.buildingGuid,
      value: needAttribute.value,
    })
    .from(buildingEffect)
    .innerJoin(effectBuff, eq(effectBuff.effectGuid, buildingEffect.effectGuid))
    .innerJoin(
      buffProvidedNeed,
      eq(buffProvidedNeed.buffGuid, effectBuff.buffGuid),
    )
    .innerJoin(
      needAttribute,
      eq(needAttribute.needGuid, buffProvidedNeed.needGuid),
    )
    .leftJoin(attribute, eq(attribute.id, needAttribute.attributeId))
    .where(inArray(buildingEffect.buildingGuid, guids))
}

function productionBuffRows(guids: Array<number>) {
  return db
    .selectDistinct({
      attribute: attribute.key,
      buildingGuid: factoryOutput.buildingGuid,
      value: needAttribute.value,
    })
    .from(factoryOutput)
    .innerJoin(need, eq(need.productGuid, factoryOutput.productGuid))
    .innerJoin(needAttribute, eq(needAttribute.needGuid, need.guid))
    .leftJoin(attribute, eq(attribute.id, needAttribute.attributeId))
    .where(inArray(factoryOutput.buildingGuid, guids))
}

async function buildingDetails(guids: Array<number>, lang: Lang) {
  const tName = localized('t_name')
  const [
    costs,
    maintenance,
    inputs,
    outputs,
    phases,
    effects,
    buffs,
    productionBuffs,
    workforce,
    requirements,
    techs,
  ] = await Promise.all([
    productRows(buildingCost, guids, lang),
    productRows(buildingMaintenance, guids, lang),
    productRows(factoryInput, guids, lang),
    productRows(factoryOutput, guids, lang),
    phaseRows(guids, lang),
    effectRows(guids),
    buffRows(guids),
    productionBuffRows(guids),
    workforceRows(guids, lang),
    unlockRequirements(guids, lang),
    db
      .select({
        buildingGuid: techUnlock.assetGuid,
        guid: tech.guid,
        icon: tech.icon,
        knowledgeNeeded: tech.knowledgeNeeded,
        name: tName.value,
      })
      .from(techUnlock)
      .innerJoin(tech, eq(tech.guid, techUnlock.techGuid))
      .leftJoin(tName, on(tName, tech.nameText, lang))
      .where(inArray(techUnlock.assetGuid, guids)),
  ])
  const serviceBuffs = groupBy(buffs, 'buildingGuid')
  // Service bonuses are also encoded as adjacency modifiers in the game data.
  const areaEffects = effects.filter(
    (effect) =>
      effect.isPercent ||
      !serviceBuffs(effect.buildingGuid).some(
        (bonus) =>
          bonus.attribute === effect.attribute && bonus.value === effect.value,
      ),
  )
  return {
    buffs: groupBy([...buffs, ...productionBuffs], 'buildingGuid'),
    costs: groupBy(costs, 'owner'),
    effects: groupBy(areaEffects, 'buildingGuid'),
    inputs: groupBy(inputs, 'owner'),
    maintenance: groupBy(maintenance, 'owner'),
    outputs: groupBy(outputs, 'owner'),
    phases: groupBy(phases, 'buildingGuid'),
    requirements: groupBy(requirements, 'assetGuid'),
    techs: groupBy(techs, 'buildingGuid'),
    workforce: groupBy(workforce, 'buildingGuid'),
  }
}

/** Buildings with costs, maintenance, factory inputs/outputs, area effects, need fulfilment and unlocking techs. */
async function queryBuildings(f: BuildingFilter & Page, id?: number) {
  const nameT = localized('name')
  const descT = localized('desc')
  const catT = localized('cat')
  const dlcT = localized('dlcName')
  const where = and(
    buildingWhere(f, nameT),
    id === undefined ? undefined : eq(building.guid, id),
  )
  const { limit, offset } = paginate(f)

  const [[{ total }], rows] = await Promise.all([
    db
      .select({
        total: count(),
      })
      .from(building)
      .leftJoin(nameT, on(nameT, building.nameText, f.lang))
      .where(where),
    db
      .select({
        baseProductivity: factory.baseProductivity,
        category: catT.value,
        cycleTime: factory.cycleTime,
        description: descT.value,
        dlc: {
          guid: dlc.guid,
          icon: dlc.icon,
          key: dlc.key,
          name: dlcT.value,
        },
        guid: building.guid,
        icon: building.icon,
        kind: building.kind,
        name: nameT.value,
        needsFuel: factory.needsFuel,
        radius: building.radius,
        region: regionColumns,
        streetRadius: building.streetRadius,
        template: building.template,
        transporterRange: factory.transporterRange,
        type: building.type,
      })
      .from(building)
      .leftJoin(nameT, on(nameT, building.nameText, f.lang))
      .leftJoin(descT, on(descT, building.descriptionText, f.lang))
      .leftJoin(catT, on(catT, building.categoryText, f.lang))
      .leftJoin(region, eq(region.id, building.regionId))
      .leftJoin(dlc, eq(dlc.guid, building.dlcGuid))
      .leftJoin(dlcT, on(dlcT, dlc.nameText, f.lang))
      .leftJoin(factory, eq(factory.buildingGuid, building.guid))
      .where(where)
      .orderBy(asc(nameT.value), asc(building.guid))
      .limit(limit)
      .offset(offset),
  ])
  const d = await buildingDetails(
    rows.map((r) => r.guid),
    f.lang,
  )
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((r) => ({
      ...r,
      /** Attributes residences gain from the service or produced goods. */
      buffs: d.buffs(r.guid).map((bonus) => ({
        ...bonus,
        name: attributeName(bonus.attribute, f.lang),
      })),
      costs: d.costs(r.guid),
      dlc: r.dlc?.guid ? r.dlc : null,
      /** area effects: attribute modifiers applied to nearby buildings */
      effects: d.effects(r.guid).map((effect) => ({
        ...effect,
        name: attributeName(effect.attribute, f.lang),
      })),
      inputs: d.inputs(r.guid),
      kind: kindLabel(r.kind, f.lang),
      maintenance: d.maintenance(r.guid),
      outputs: d.outputs(r.guid),
      /** construction phases of a monument, in order; empty for ordinary buildings */
      phases: d.phases(r.guid),
      type: typeLabel(r.type, f.lang),
      unlockedBy: d.techs(r.guid),
      unlockRequirements:
        d.phases(r.guid)[0]?.unlockRequirements ?? d.requirements(r.guid),
      workforce: d
        .workforce(r.guid)
        .map(({ buildingGuid, ...workforce }) => workforce),
    })),
    total,
  }
}

async function get({ id, lang }: Get) {
  return (
    (
      await queryBuildings(
        {
          lang,
          perPage: 1,
        },
        id,
      )
    ).rows[0] ?? null
  )
}

async function list(f: BuildingFilter & Page) {
  return await queryBuildings(f)
}

/** distinct in-game building categories (Amenity, Pit, Quarry …) keyed by English name */
async function categories({ lang }: { lang: Lang }) {
  const catEn = localized('category_en')
  const catT = localized('category')
  return await db
    .selectDistinct({
      key: sql<BuildingCategory>`${catEn.value}`,
      name: catT.value,
    })
    .from(building)
    .innerJoin(catEn, on(catEn, building.categoryText, 'en'))
    .innerJoin(catT, on(catT, building.categoryText, lang))
    .orderBy(asc(catT.value))
}

export const buildings = {
  categories,
  get,
  kinds,
  list,
  types,
}
