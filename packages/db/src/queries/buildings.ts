import { and, asc, count, eq, exists, inArray, like, sql } from 'drizzle-orm'

import { db } from '../db'
import {
  building,
  buildingCost,
  buildingMaintenance,
  factory,
  factoryInput,
  factoryOutput,
  populationLevel,
  product,
  region,
  tech,
  techUnlock,
} from '../schema'
import {
  groupBy,
  type Lang,
  localized,
  on,
  type Page,
  paginate,
} from './shared'
export type BuildingFilter = {
  lang: Lang
  search?: string
  kind?: Array<string>
  buildingType?: string
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

function productRows(
  table:
    | typeof factoryInput
    | typeof factoryOutput
    | typeof buildingCost
    | typeof buildingMaintenance,
  guids: Array<number>,
  lang: Lang,
) {
  const pName = localized('p_name')
  return db
    .select({
      amount: table.amount,
      buildingGuid: table.buildingGuid,
      guid: product.guid,
      icon: product.icon,
      name: pName.value,
    })
    .from(table)
    .innerJoin(product, eq(product.guid, table.productGuid))
    .leftJoin(pName, on(pName, product.nameText, lang))
    .where(inArray(table.buildingGuid, guids))
}

async function buildingDetails(guids: Array<number>, lang: Lang) {
  const tName = localized('t_name')
  const [costs, maintenance, inputs, outputs, techs] = await Promise.all([
    productRows(buildingCost, guids, lang),
    productRows(buildingMaintenance, guids, lang),
    productRows(factoryInput, guids, lang),
    productRows(factoryOutput, guids, lang),
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
    costs: groupBy(costs, 'buildingGuid'),
    inputs: groupBy(inputs, 'buildingGuid'),
    maintenance: groupBy(maintenance, 'buildingGuid'),
    outputs: groupBy(outputs, 'buildingGuid'),
    techs: groupBy(techs, 'buildingGuid'),
  }
}

/** Buildings with costs, maintenance, factory inputs/outputs and unlocking techs. */
export async function getBuildings(f: BuildingFilter & Page) {
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
      unlockedBy: d.techs(r.guid),
    })),
    total,
  }
}
