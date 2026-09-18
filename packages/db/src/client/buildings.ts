import { and, asc, count, eq, exists, inArray, like, sql } from 'drizzle-orm'

import { db } from '../db'
import { type BuildingKind, type BuildingType, type Lang } from '../enums'
import {
  building,
  buildingCost,
  buildingMaintenance,
  buildingPhase,
  buildingPhaseCost,
  buildingPhaseMaintenance,
  factory,
  factoryInput,
  factoryOutput,
  populationLevel,
  product,
  region,
  tech,
  techUnlock,
} from '../schema'
import { type Get, groupBy, localized, on, type Page, paginate } from './shared'
export type BuildingFilter = {
  lang: Lang
  guid?: number
  search?: string
  kind?: Array<BuildingKind>
  buildingType?: BuildingType
  regionId?: number
  /** workforce tier (population_level guid) */
  populationLevel?: number
  /** product guid consumed / produced / needed to build */
  inputProduct?: number
  outputProduct?: number
  costProduct?: number
}

function hasProduct(
  table: typeof factoryInput | typeof factoryOutput | typeof buildingCost,
  productGuid: number,
) {
  return exists(
    db
      .select({ one: sql`1` })
      .from(table)
      .where(
        and(
          eq(table.buildingGuid, building.guid),
          eq(table.productGuid, productGuid),
        ),
      ),
  )
}

function buildingWhere(f: BuildingFilter, nameT: ReturnType<typeof localized>) {
  return and(
    f.guid ? eq(building.guid, f.guid) : undefined,
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.kind?.length ? inArray(building.kind, f.kind) : undefined,
    f.buildingType ? eq(building.buildingType, f.buildingType) : undefined,
    f.regionId ? eq(building.regionId, f.regionId) : undefined,
    f.populationLevel
      ? eq(building.populationLevelGuid, f.populationLevel)
      : undefined,
    f.inputProduct ? hasProduct(factoryInput, f.inputProduct) : undefined,
    f.outputProduct ? hasProduct(factoryOutput, f.outputProduct) : undefined,
    f.costProduct ? hasProduct(buildingCost, f.costProduct) : undefined,
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
  return rows.map((r) => ({ ...r, costs: c(r.guid), maintenance: m(r.guid) }))
}

async function buildingDetails(guids: Array<number>, lang: Lang) {
  const tName = localized('t_name')
  const [costs, maintenance, inputs, outputs, phases, techs] =
    await Promise.all([
      productRows(buildingCost, guids, lang),
      productRows(buildingMaintenance, guids, lang),
      productRows(factoryInput, guids, lang),
      productRows(factoryOutput, guids, lang),
      phaseRows(guids, lang),
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
    costs: groupBy(costs, 'owner'),
    inputs: groupBy(inputs, 'owner'),
    maintenance: groupBy(maintenance, 'owner'),
    outputs: groupBy(outputs, 'owner'),
    phases: groupBy(phases, 'buildingGuid'),
    techs: groupBy(techs, 'buildingGuid'),
  }
}

/** Buildings with costs, maintenance, factory inputs/outputs and unlocking techs. */
async function list(f: BuildingFilter & Page) {
  const nameT = localized('name')
  const descT = localized('desc')
  const catT = localized('cat')
  const plT = localized('pl')
  const where = buildingWhere(f, nameT)
  const { limit, offset } = paginate(f)

  const [[{ total }], rows] = await Promise.all([
    db
      .select({ total: count() })
      .from(building)
      .leftJoin(nameT, on(nameT, building.nameText, f.lang))
      .where(where),
    db
      .select({
        baseProductivity: factory.baseProductivity,
        buildingType: building.buildingType,
        category: catT.value,
        cycleTime: factory.cycleTime,
        description: descT.value,
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
        region: { id: region.id, key: region.key, name: region.name },
        streetRadius: building.streetRadius,
        template: building.template,
        transporterRange: factory.transporterRange,
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
    rows: rows.map((r) => ({
      ...r,
      costs: d.costs(r.guid),
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
  return (await list({ guid: id, lang })).rows[0] ?? null
}

export const buildings = { get, list }
