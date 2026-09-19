import { SearchTypes } from '@anno/db/search'
import { hasLocale } from 'next-intl'
import { z } from 'zod'

import { routing } from '@/intl'

export function validateLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
}

const IdSchema = z.coerce.number()

export function getId(id: string) {
  return IdSchema.parse(id)
}

const SearchFiltersSchema = z.object({
  p: z.coerce.number().optional(),
  q: z.coerce.string(),
  t: z.enum(SearchTypes).optional(),
})

export function validateSearchFilters(type: unknown) {
  const { p, q, t } = SearchFiltersSchema.parse(type)

  return {
    page: p,
    query: q,
    type: t,
  }
}
