import { and, eq, sql } from 'drizzle-orm'
import { alias, type SQLiteColumn } from 'drizzle-orm/sqlite-core'

import { type Lang, langNames } from '../enums'
import { attribute, buffModifier, region, translation } from '../schema'

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
/** `region` columns for a nested select; `key` is typed by the generated enum */
export const regionColumns = {
  id: region.id,
  key: region.key,
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

/** one `buff_modifier` row with its attribute key; join buffModifier + attribute first */
export const modifierColumns = {
  attribute: attribute.key,
  buffGuid: buffModifier.buffGuid,
  // productivity is always a percentage in game, but its `Percental` flag is only set on negative values
  isPercent:
    sql`coalesce(${buffModifier.isPercent}, 0) or ${buffModifier.path} = 'FactoryUpgrade.ProductivityUpgrade'`.mapWith(
      Boolean,
    ),
  path: buffModifier.path,
  productGuid: buffModifier.productGuid,
  value: buffModifier.value,
}
