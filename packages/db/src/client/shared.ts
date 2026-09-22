import { and, eq, exists, inArray, sql } from 'drizzle-orm'
import { alias, type SQLiteColumn } from 'drizzle-orm/sqlite-core'

import { db } from '../db'
import { type BuildingCategory, type Lang, langNames } from '../enums'
import {
  attribute,
  buff,
  buffModifier,
  building,
  region,
  translation,
} from '../schema'

export type Page = {
  page?: number
  perPage?: number
}
export type Get = {
  id: number
  lang: Lang
}
const PER_PAGE = 48

export function langId(lang: Lang) {
  return sql`(select id from lang where code = ${langNames[lang]})`
}
/** Aliased `text` table; join with `on(t, table.nameText, lang)`. */
export function localized(name: string) {
  return alias(translation, name)
}
export function on(
  t: ReturnType<typeof localized>,
  lineId: SQLiteColumn,
  lang: Lang,
) {
  return and(eq(t.lineId, lineId), eq(t.langId, langId(lang)))
}
/** `building.category_text` is one of `keys` (English category names, see `buildings.categories`). */
export function categoryIn(keys: Array<BuildingCategory>) {
  const catEn = localized('category_en')
  return exists(
    db
      .select({
        one: sql`1`,
      })
      .from(catEn)
      .where(
        and(on(catEn, building.categoryText, 'en'), inArray(catEn.value, keys)),
      ),
  )
}

/** `region` columns for a nested select; `key` is typed by the generated enum */
export const regionColumns = {
  id: region.id,
  key: region.key,
  name: region.name,
}

export function paginate({ page = 1, perPage = PER_PAGE }: Page) {
  return {
    limit: perPage,
    offset: (page - 1) * perPage,
  }
}

export function groupBy<T, K extends keyof T>(rows: Array<T>, key: K) {
  const map = new Map<T[K], Array<T>>()
  for (const row of rows) {
    const list = map.get(row[key]) ?? []
    list.push(row)
    map.set(row[key], list)
  }
  return (k: T[K]) => map.get(k) ?? []
}

/** one `buff_modifier` row with its attribute key; join buff + buffModifier + attribute first */
export const modifierColumns = {
  attribute: attribute.key,
  buffGuid: buff.guid,
  // productivity is always a percentage in game, but its `Percental` flag is only set on negative values
  isPercent:
    sql`coalesce(${buffModifier.isPercent}, 0) or ${buffModifier.path} = 'FactoryUpgrade.ProductivityUpgrade'`.mapWith(
      Boolean,
    ),
  path: buffModifier.path,
  value: buffModifier.value,
}
