import { langValues } from '@anno/db/enums'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // every language the game ships; each needs a locales/<code>.json
  locales: langValues,
})
