import { asc } from 'drizzle-orm'

import { db } from '../db'
import { type Lang } from '../enums'
import { region } from '../schema'
import { regionColumns } from './shared'

export type RegionFilter = {
  lang: Lang
}

/** oldest first */
async function list(_: RegionFilter) {
  return await db.select(regionColumns).from(region).orderBy(asc(region.id))
}

export const regions = {
  list,
}
