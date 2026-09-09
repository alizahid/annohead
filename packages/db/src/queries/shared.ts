import { and, eq, sql } from 'drizzle-orm'
import { alias, type SQLiteColumn } from 'drizzle-orm/sqlite-core'

import { translation } from '../schema'

export type Lang = 'english' | 'german'
export type Page = { page?: number; perPage?: number }
const PER_PAGE = 50

export const langId = (lang: Lang) =>
  sql`(select id from lang where code = ${lang})`
/** Aliased `text` table; join with `on(t, table.nameText, lang)`. */
export const localized = (name: string) => alias(translation, name)
export const on = (
  t: ReturnType<typeof localized>,
  lineId: SQLiteColumn,
  lang: Lang,
) => and(eq(t.lineId, lineId), eq(t.langId, langId(lang)))

export const paginate = ({ page = 1, perPage = PER_PAGE }: Page) => ({
  limit: perPage,
  offset: (page - 1) * perPage,
})

export const groupBy = <T, K extends keyof T>(rows: Array<T>, key: K) => {
  const map = new Map<T[K], Array<T>>()
  for (const row of rows) {
    const list = map.get(row[key]) ?? []
    list.push(row)
    map.set(row[key], list)
  }
  return (k: T[K]) => map.get(k) ?? []
}
