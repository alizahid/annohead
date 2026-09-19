import { asc } from 'drizzle-orm'

import { db } from '../db'
import { type Lang } from '../enums'
import { populationLevel } from '../schema'
import { localized, on } from './shared'

export type PopulationTierFilter = { lang: Lang }

async function list({ lang }: PopulationTierFilter) {
  const nameT = localized('name')
  const rows = await db
    .select({
      guid: populationLevel.guid,
      icon: populationLevel.icon,
      name: nameT.value,
      regionId: populationLevel.regionId,
      tier: populationLevel.tier,
      workforceProductGuid: populationLevel.workforceProductGuid,
    })
    .from(populationLevel)
    .leftJoin(nameT, on(nameT, populationLevel.nameText, lang))
    .orderBy(
      asc(populationLevel.regionId),
      asc(populationLevel.tier),
      asc(populationLevel.guid),
    )
  return rows
}

export const populationTiers = { list }
