import {
  allocationValues,
  attributeValues,
  nicheValues,
  rarityValues,
} from '@anno/db/enums'
import { SearchTypes } from '@anno/db/search'
import { type QuestPicks } from '@anno/db/walk'
import { hasLocale } from 'next-intl'
import {
  createLoader,
  createParser,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import { z } from 'zod'

import { routing } from '@/intl'

export function validateLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
}

const IdSchema = z.coerce.number()

export function getId(id: string) {
  return IdSchema.parse(id)
}

export const searchFilters = {
  page: parseAsInteger,
  query: parseAsString.withDefault(''),
  types: parseAsArrayOf(parseAsStringLiteral(SearchTypes)),
}

export const parseSearchFilters = createLoader(searchFilters)

export type SearchFilters = Awaited<ReturnType<typeof parseSearchFilters>>

export const buildingFilters = {
  dlcs: parseAsArrayOf(parseAsInteger),
  page: parseAsInteger,
  regions: parseAsArrayOf(parseAsInteger),
  tiers: parseAsArrayOf(parseAsInteger),
  types: parseAsArrayOf(parseAsInteger),
}

export const parseBuildingFilters = createLoader(buildingFilters)

export type BuildingFilters = Awaited<ReturnType<typeof parseBuildingFilters>>

export const itemFilters = {
  attributes: parseAsArrayOf(parseAsStringLiteral(attributeValues)),
  dlcs: parseAsArrayOf(parseAsInteger),
  niches: parseAsArrayOf(parseAsStringLiteral(nicheValues)),
  page: parseAsInteger,
  rarities: parseAsArrayOf(parseAsStringLiteral(rarityValues)),
  types: parseAsArrayOf(
    parseAsStringLiteral([...allocationValues, 'Charioteer'] as const),
  ),
}

export const parseItemFilters = createLoader(itemFilters)

export type ItemFilters = Awaited<ReturnType<typeof parseItemFilters>>

export const chainFilters = {
  dlcs: parseAsArrayOf(parseAsInteger),
  page: parseAsInteger,
  regions: parseAsArrayOf(parseAsInteger),
  tiers: parseAsArrayOf(parseAsInteger),
  types: parseAsArrayOf(parseAsInteger),
}

export const parseChainFilters = createLoader(chainFilters)

export type ChainFilters = Awaited<ReturnType<typeof parseChainFilters>>

export const productFilters = {
  dlcs: parseAsArrayOf(parseAsInteger),
  page: parseAsInteger,
  regions: parseAsArrayOf(parseAsInteger),
  tiers: parseAsArrayOf(parseAsInteger),
  types: parseAsArrayOf(parseAsInteger),
}

export const parseProductFilters = createLoader(productFilters)

export type ProductFilters = Awaited<ReturnType<typeof parseProductFilters>>

export const ornamentFilters = {
  dlcs: parseAsArrayOf(parseAsInteger),
  page: parseAsInteger,
  regions: parseAsArrayOf(parseAsInteger),
  types: parseAsArrayOf(parseAsInteger),
}

export const parseOrnamentFilters = createLoader(ornamentFilters)

export type OrnamentFilters = Awaited<ReturnType<typeof parseOrnamentFilters>>

export const questFilters = {
  dlcs: parseAsArrayOf(parseAsInteger),
  page: parseAsInteger,
  regions: parseAsArrayOf(parseAsInteger),
}

export const parseQuestFilters = createLoader(questFilters)

export type QuestFilters = Awaited<ReturnType<typeof parseQuestFilters>>

const PICK = /^(\d+)\.(\d+)$/u

/** "50807.0_50814.2": the option picked at each choice, for every quest of a series played so far */
export function serializeQuestPicks(picks: QuestPicks) {
  return Object.entries(picks)
    .map(([choice, idx]) => `${choice}.${idx}`)
    .join('_')
}

export const questPicks = {
  picks: createParser<QuestPicks>({
    eq: (a, b) => serializeQuestPicks(a) === serializeQuestPicks(b),
    parse: (value) =>
      Object.fromEntries(
        value.split('_').flatMap((pick) => {
          const match = PICK.exec(pick)

          return match ? [[Number(match[1]), Number(match[2])]] : []
        }),
      ),
    serialize: serializeQuestPicks,
  }).withDefault({}),
}

export const parseQuestPicks = createLoader(questPicks)

export const unitFilters = {
  page: parseAsInteger,
  regions: parseAsArrayOf(parseAsInteger),
  types: parseAsArrayOf(parseAsInteger),
}

export const parseUnitFilters = createLoader(unitFilters)

export type UnitFilters = Awaited<ReturnType<typeof parseUnitFilters>>
