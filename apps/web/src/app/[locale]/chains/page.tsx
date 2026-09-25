import { anno } from '@anno/db/client'
import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ChainList } from '@/components/chains/list'
import { parseChainFilters, validateLocale } from '@/lib/validators'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('page.chains')

  return {
    title: t('title'),
  }
}

export default async function Page({
  params,
  searchParams,
}: PageProps<'/[locale]/chains'>) {
  const { locale } = await params

  const lang = validateLocale(locale)

  const filters = parseChainFilters(await searchParams)

  const [dlcs, regions, tiers, types, chains] = await Promise.all([
    anno.dlc.list({
      lang,
    }),
    anno.regions.list({
      lang,
    }),
    anno.populationTiers.list({
      lang,
    }),
    anno.chains.types({
      lang,
    }),
    anno.chains.list({
      dlcs: filters.dlcs ?? undefined,
      lang,
      page: filters.page ?? undefined,
      regions: filters.regions ?? undefined,
      search: filters.query ?? undefined,
      tiers: filters.tiers ?? undefined,
      types: filters.type ?? undefined,
    }),
  ])

  return (
    <ChainList
      chains={chains}
      dlcs={dlcs}
      filters={filters}
      regions={regions}
      tiers={tiers}
      types={types}
    />
  )
}
