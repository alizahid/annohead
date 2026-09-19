import { anno } from '@anno/db/client'
import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { BuildingsPage } from '@/components/buildings/page'
import { parseBuildingFilters, validateLocale } from '@/lib/validators'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('component.buildings.page')

  return {
    title: t('meta.title'),
  }
}

export default async function Page({
  params,
  searchParams,
}: PageProps<'/[locale]/buildings'>) {
  const { locale } = await params

  const lang = validateLocale(locale)

  const filters = parseBuildingFilters(await searchParams)

  const [dlcs, regions, tiers, kinds, buildings] = await Promise.all([
    anno.dlc.list({
      lang,
    }),
    anno.regions.list({
      lang,
    }),
    anno.populationTiers.list({
      lang,
    }),
    anno.buildings.kinds({
      lang,
    }),
    anno.buildings.list({
      dlc: filters.dlcs ?? undefined,
      kind: filters.kind ?? undefined,
      lang,
      page: filters.page ?? undefined,
      populationLevel: filters.tiers ?? undefined,
      regionId: filters.regions ?? undefined,
      search: filters.query ?? undefined,
      type: filters.type ?? undefined,
    }),
  ])

  return (
    <BuildingsPage
      buildings={buildings}
      dlcs={dlcs}
      filters={filters}
      kinds={kinds}
      regions={regions}
      tiers={tiers}
    />
  )
}
