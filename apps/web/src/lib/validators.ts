import {
  allocationValues,
  attributeValues,
  buildingCategoryValues,
  buildingKindValues,
  buildingTypeValues,
  itemTypeValues,
  nicheValues,
  rarityValues,
} from '@anno/db/enums'
import { SearchTypes } from '@anno/db/search'
import { hasLocale } from 'next-intl'
import {
  createLoader,
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
  type: parseAsArrayOf(parseAsStringLiteral(SearchTypes)),
}

export const parseSearchFilters = createLoader(searchFilters)

export type SearchFilters = Awaited<ReturnType<typeof parseSearchFilters>>

export const buildingFilters = {
  dlcs: parseAsArrayOf(parseAsInteger),
  kind: parseAsArrayOf(parseAsStringLiteral(buildingKindValues)),
  page: parseAsInteger,
  query: parseAsString,
  regions: parseAsArrayOf(parseAsInteger),
  tiers: parseAsArrayOf(parseAsInteger),
  type: parseAsArrayOf(parseAsStringLiteral(buildingTypeValues)),
}

export const parseBuildingFilters = createLoader(buildingFilters)

export type BuildingFilters = Awaited<ReturnType<typeof parseBuildingFilters>>

export const itemFilters = {
  allocations: parseAsArrayOf(parseAsStringLiteral(allocationValues)),
  attributes: parseAsArrayOf(parseAsStringLiteral(attributeValues)),
  categories: parseAsArrayOf(parseAsStringLiteral(buildingCategoryValues)),
  dlcs: parseAsArrayOf(parseAsInteger),
  niches: parseAsArrayOf(parseAsStringLiteral(nicheValues)),
  page: parseAsInteger,
  query: parseAsString,
  rarities: parseAsArrayOf(parseAsStringLiteral(rarityValues)),
  types: parseAsArrayOf(parseAsStringLiteral(itemTypeValues)),
}

export const parseItemFilters = createLoader(itemFilters)

export type ItemFilters = Awaited<ReturnType<typeof parseItemFilters>>
