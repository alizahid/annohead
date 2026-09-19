import { asc } from 'drizzle-orm'

import { db } from '../db'
import { type Lang } from '../enums'
import { dlc as dlcTable } from '../schema'
import { localized, on } from './shared'

export type DlcFilter = { lang: Lang }

async function list({ lang }: DlcFilter) {
  const nameT = localized('name')
  const rows = await db
    .select({
      guid: dlcTable.guid,
      icon: dlcTable.icon,
      key: dlcTable.key,
      name: nameT.value,
    })
    .from(dlcTable)
    .leftJoin(nameT, on(nameT, dlcTable.nameText, lang))
    .orderBy(asc(nameT.value), asc(dlcTable.guid))
  return rows
}

export const dlc = { list }
