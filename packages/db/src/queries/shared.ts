import { and, eq, sql } from 'drizzle-orm'
import { alias, type SQLiteColumn } from 'drizzle-orm/sqlite-core'

import { translation } from '../schema'

export type Lang = 'english' | 'german'
export type Page = { page?: number; perPage?: number }
const PER_PAGE = 50

export function langId(lang: Lang) {
  return sql`(select id from lang where code = ${lang})`
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
