import { anno } from '@anno/db/client'
import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { SearchPage } from '@/components/search/page'
import { validateLocale, validateSearchFilters } from '@/lib/validators'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('component.search.page')

  return {
    title: t('meta.title'),
  }
}

export default async function Page({
  params,
  searchParams,
}: PageProps<'/[locale]/search'>) {
  const { locale } = await params
  const { q, t, p } = await searchParams

  const { page, query, type } = validateSearchFilters({
    p,
    q,
    t: t || undefined,
  })

  const { rows, pages, total } = await anno.search({
    lang: validateLocale(locale),
    page,
    query,
    type: type ? [type] : undefined,
  })

  return (
    <SearchPage
      hits={rows.filter((item) => item.name)}
      page={page}
      pages={pages}
      query={query}
      total={total}
      type={type}
    />
  )
}
