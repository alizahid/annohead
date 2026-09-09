import { and, asc, count, eq, exists, inArray, like, sql } from 'drizzle-orm'

import { db } from '../db'
import {
  building,
  factoryInput,
  factoryOutput,
  product,
  productRegion,
} from '../schema'
import {
  groupBy,
  type Lang,
  localized,
  on,
  type Page,
  paginate,
} from './shared'
export type ProductFilter = { lang: Lang; search?: string; regionId?: number }

/** Products with the buildings that produce and consume them. */
export async function getProducts(f: ProductFilter & Page) {
  const nameT = localized('name')
  const catT = localized('cat')
  const bName = localized('b_name')
  const where = and(
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.regionId
      ? exists(
          db
            .select({ one: sql`1` })
            .from(productRegion)
            .where(
              and(
                eq(productRegion.productGuid, product.guid),
                eq(productRegion.regionId, f.regionId),
              ),
            ),
        )
      : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({ total: count() })
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
  const [producedBy, consumedBy] = await Promise.all([
    usage(factoryOutput),
    usage(factoryInput),
  ])
  const p = groupBy(producedBy, 'productGuid')
  const c = groupBy(consumedBy, 'productGuid')
  return {
    rows: rows.map((r) => ({
      ...r,
      consumedBy: c(r.guid),
      producedBy: p(r.guid),
    })),
    total,
  }
}
