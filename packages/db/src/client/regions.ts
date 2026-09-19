import { db } from '../db'
import { type Lang } from '../enums'
import { region } from '../schema'
import { regionColumns } from './shared'

export type RegionFilter = {
  lang: Lang
}

async function list({ lang }: RegionFilter) {
  const rows = await db.select(regionColumns).from(region)
  // Region names are stored without translations; use the locale for ordering.
  const collator = new Intl.Collator(lang)
  rows.sort(
    (a, b) => collator.compare(a.name ?? '', b.name ?? '') || a.id - b.id,
  )
  return rows
}

export const regions = {
  list,
}
