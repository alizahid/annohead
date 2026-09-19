import { type SearchType, SearchTypes } from '@anno/db/search'
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

const SearchTypeSchema = z.enum(SearchTypes)

export function validateSearchType(type: unknown): SearchType | undefined {
  if (SearchTypeSchema.validate(type)) {
    return SearchTypeSchema.parse(type)
  }
}
