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
  p: z.coerce.number().optional().catch(undefined),
  q: z.string().catch(''),
  t: z.enum(SearchTypes).optional().catch(undefined),
})

export function validateSearchFilters(
  type: Record<string, string | Array<string> | undefined>,
) {
  const { p, q, t } = SearchFiltersSchema.parse({
    ...type,
    t: type.t || undefined,
  })

  return {
    page: p,
    query: q,
    type: t,
  }
}
