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
  type Lang,
  type StorageLevel,
  storageLevelValues,
  type TransportType,
  transportTypeValues,
} from '../enums'
import {
  building,
  dlc,
  factoryInput,
  factoryOutput,
  need,
  product,
  productRegion,
  region,
  residence,
  residenceNeed,
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
export type ProductFilter = {
  lang: Lang
  guid?: number
  search?: string
  regions?: Array<number>
  categories?: Array<TransportType>
  storageLevels?: Array<StorageLevel>
  /** DLC guids of a producing building */
  dlcs?: Array<number>
  /** population_level guids whose residences need the product */
  tiers?: Array<number>
}

// matches the game's product category texts
const categoryNames: Record<Lang, Record<TransportType, string>> = {
  de: {
    Intermediate: 'Zwischenprodukt',
    Material: 'Baumaterial',
    Needs: 'Bedürfnis',
    Raw: 'Rohmaterial',
  },
  en: {
    Intermediate: 'Intermediate Product',
    Material: 'Construction Material',
    Needs: 'Need',
    Raw: 'Raw Material',
  },
}

// Area: island-wide (workforce), Building: warehouses (goods), Meta: empire-wide (money, permits)
const storageLevelNames: Record<Lang, Record<StorageLevel, string>> = {
  de: {
    Area: 'Insel',
    Building: 'Lagerhaus',
    Meta: 'Reich',
  },
  en: {
    Area: 'Island',
    Building: 'Warehouse',
    Meta: 'Empire',
  },
}

function categories({ lang }: { lang: Lang }) {
  return transportTypeValues.map((key) => ({
    key,
    name: categoryNames[lang][key],
  }))
}

function storageLevels({ lang }: { lang: Lang }) {
  return storageLevelValues.map((key) => ({
    key,
    name: storageLevelNames[lang][key],
  }))
}

/** some building producing the product matches `condition` */
function producerWhere(condition: SQL) {
  return exists(
    db
      .select({ one: sql`1` })
      .from(factoryOutput)
      .innerJoin(building, eq(building.guid, factoryOutput.buildingGuid))
      .where(and(eq(factoryOutput.productGuid, product.guid), condition)),
  )
}

/** Products with the buildings that produce and consume them. */
async function list(f: ProductFilter & Page) {
  const nameT = localized('name')
  const catT = localized('cat')
  const bName = localized('b_name')
  const where = and(
    f.guid ? eq(product.guid, f.guid) : undefined,
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.categories?.length
      ? inArray(product.transportType, f.categories)
      : undefined,
    f.dlcs?.length
      ? producerWhere(inArray(building.dlcGuid, f.dlcs))
      : undefined,
    f.tiers?.length
      ? exists(
          db
            .select({ one: sql`1` })
            .from(need)
            .innerJoin(residenceNeed, eq(residenceNeed.needGuid, need.guid))
            .innerJoin(
              residence,
              eq(residence.buildingGuid, residenceNeed.buildingGuid),
            )
            .where(
              and(
                eq(need.productGuid, product.guid),
                inArray(residence.populationLevelGuid, f.tiers),
              ),
            ),
        )
      : undefined,
    f.storageLevels?.length
      ? inArray(product.storageLevel, f.storageLevels)
      : undefined,
    f.regions?.length
      ? exists(
          db
            .select({
              one: sql`1`,
            })
            .from(productRegion)
            .where(
              and(
                eq(productRegion.productGuid, product.guid),
                inArray(productRegion.regionId, f.regions),
              ),
            ),
        )
      : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({
        total: count(),
      })
      .from(product)
      .leftJoin(nameT, on(nameT, product.nameText, f.lang))
      .where(where),
    db
      .select({
        basePrice: product.basePrice,
        category: catT.value,
        guid: product.guid,
        icon: product.icon,
        name: nameT.value,
        storageLevel: product.storageLevel,
        transportType: product.transportType,
      })
      .from(product)
      .leftJoin(nameT, on(nameT, product.nameText, f.lang))
      .leftJoin(catT, on(catT, product.categoryText, f.lang))
      .where(where)
      .orderBy(asc(nameT.value), asc(product.guid))
      .limit(limit)
      .offset(offset),
  ])
  const guids = rows.map((r) => r.guid)
  function usage(table: typeof factoryInput | typeof factoryOutput) {
    return db
      .select({
        amount: table.amount,
        guid: building.guid,
        icon: building.icon,
        name: bName.value,
        productGuid: table.productGuid,
      })
      .from(table)
      .innerJoin(building, eq(building.guid, table.buildingGuid))
      .leftJoin(bName, on(bName, building.nameText, f.lang))
      .where(inArray(table.productGuid, guids))
  }
  const dlcT = localized('dlc_name')
  const [producedBy, consumedBy, regions, producerDlcs] = await Promise.all([
    usage(factoryOutput),
    usage(factoryInput),
    db
      .select({
        productGuid: productRegion.productGuid,
        region: regionColumns,
      })
      .from(productRegion)
      .innerJoin(region, eq(region.id, productRegion.regionId))
      .where(inArray(productRegion.productGuid, guids))
      .orderBy(asc(region.id)),
    db
      .select({
        dlc: {
          guid: dlc.guid,
          icon: dlc.icon,
          key: dlc.key,
          name: dlcT.value,
        },
        productGuid: factoryOutput.productGuid,
      })
      .from(factoryOutput)
      .innerJoin(building, eq(building.guid, factoryOutput.buildingGuid))
      .leftJoin(dlc, eq(dlc.guid, building.dlcGuid))
      .leftJoin(dlcT, on(dlcT, dlc.nameText, f.lang))
      .where(inArray(factoryOutput.productGuid, guids))
      .orderBy(asc(dlc.guid)),
  ])
  const p = groupBy(producedBy, 'productGuid')
  const c = groupBy(consumedBy, 'productGuid')
  const rg = groupBy(regions, 'productGuid')
  const d = groupBy(producerDlcs, 'productGuid')
  // a product is DLC content only when every building producing it is
  function productDlc(guid: number) {
    const producers = d(guid)
    return producers.length && producers.every((x) => x.dlc?.guid)
      ? producers[0].dlc
      : null
  }
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((row) => ({
      ...row,
      consumedBy: c(row.guid),
      dlc: productDlc(row.guid),
      producedBy: p(row.guid),
      regions: rg(row.guid).map((x) => x.region),
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

export const products = {
  categories,
  get,
  list,
  storageLevels,
}
