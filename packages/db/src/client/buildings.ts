import { and, asc, count, eq, inArray, like } from 'drizzle-orm'

import { db } from '../db'
import { type BuildingKind, type BuildingType, type Lang } from '../enums'
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
  effectBuff,
  factory,
  factoryInput,
  factoryOutput,
  needAttribute,
  populationLevel,
  product,
  region,
  tech,
  techUnlock,
} from '../schema'
import { kinds, types } from './building-labels'
import {
  type Get,
  groupBy,
  localized,
  modifierColumns,
  on,
  type Page,
  paginate,
  regionColumns,
} from './shared'
export type BuildingFilter = {
  lang: Lang
  search?: string
  kind?: Array<BuildingKind>
  type?: Array<BuildingType>
  regionId?: Array<number>
  /** DLC guids */
  dlc?: Array<number>
  /** workforce tier (population_level guid) */
  populationLevel?: Array<number>
}

function buildingWhere(f: BuildingFilter, nameT: ReturnType<typeof localized>) {
  return and(
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.kind?.length ? inArray(building.kind, f.kind) : undefined,
    f.type?.length ? inArray(building.type, f.type) : undefined,
    f.regionId?.length ? inArray(building.regionId, f.regionId) : undefined,
    f.dlc?.length ? inArray(building.dlcGuid, f.dlc) : undefined,
    f.populationLevel?.length
      ? inArray(building.populationLevelGuid, f.populationLevel)
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

async function phaseRows(guids: Array<number>, lang: Lang) {
  const nameT = localized('ph_name')
  const rows = await db
    .select({
      buildingGuid: buildingPhase.buildingGuid,
      guid: buildingPhase.guid,
      name: nameT.value,
      phase: buildingPhase.phase,
    })
    .from(buildingPhase)
    .leftJoin(nameT, on(nameT, buildingPhase.nameText, lang))
    .where(inArray(buildingPhase.buildingGuid, guids))
    .orderBy(asc(buildingPhase.phase))
  const phaseGuids = rows.map((r) => r.guid)
  const [costs, maintenance] = await Promise.all([
    productRows(buildingPhaseCost, phaseGuids, lang),
    productRows(buildingPhaseMaintenance, phaseGuids, lang),
  ])
  const c = groupBy(costs, 'owner')
  const m = groupBy(maintenance, 'owner')
  return rows.map((r) => ({
    ...r,
    costs: c(r.guid),
    maintenance: m(r.guid),
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

/** Need fulfilment: attribute values residences gain when this building's public service meets their need. */
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

async function buildingDetails(guids: Array<number>, lang: Lang) {
  const tName = localized('t_name')
  const [costs, maintenance, inputs, outputs, phases, effects, buffs, techs] =
    await Promise.all([
      productRows(buildingCost, guids, lang),
      productRows(buildingMaintenance, guids, lang),
      productRows(factoryInput, guids, lang),
      productRows(factoryOutput, guids, lang),
      phaseRows(guids, lang),
      effectRows(guids),
      buffRows(guids),
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
  return {
    buffs: groupBy(buffs, 'buildingGuid'),
    costs: groupBy(costs, 'owner'),
    effects: groupBy(effects, 'buildingGuid'),
    inputs: groupBy(inputs, 'owner'),
    maintenance: groupBy(maintenance, 'owner'),
    outputs: groupBy(outputs, 'owner'),
    phases: groupBy(phases, 'buildingGuid'),
    techs: groupBy(techs, 'buildingGuid'),
  }
}

/** Buildings with costs, maintenance, factory inputs/outputs, area effects, need fulfilment and unlocking techs. */
async function queryBuildings(f: BuildingFilter & Page, id?: number) {
  const nameT = localized('name')
  const descT = localized('desc')
  const catT = localized('cat')
  const plT = localized('pl')
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
        dlcGuid: building.dlcGuid,
        guid: building.guid,
        icon: building.icon,
        kind: building.kind,
        name: nameT.value,
        populationLevel: {
          guid: populationLevel.guid,
          icon: populationLevel.icon,
          name: plT.value,
          tier: populationLevel.tier,
        },
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
      .leftJoin(
        populationLevel,
        eq(populationLevel.guid, building.populationLevelGuid),
      )
      .leftJoin(plT, on(plT, populationLevel.nameText, f.lang))
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
      /** need fulfilment of a public building: attributes residences gain */
      buffs: d.buffs(r.guid),
      costs: d.costs(r.guid),
      /** area effects: attribute modifiers applied to nearby buildings */
      effects: d.effects(r.guid),
      inputs: d.inputs(r.guid),
      maintenance: d.maintenance(r.guid),
      outputs: d.outputs(r.guid),
      /** construction phases of a monument, in order; empty for ordinary buildings */
      phases: d.phases(r.guid),
      unlockedBy: d.techs(r.guid),
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

export const buildings = {
  get,
  kinds,
  list,
  types,
}
