import { anno } from '@anno/db/client'
import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ProductList } from '@/components/products/list'
import { parseProductFilters, validateLocale } from '@/lib/validators'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('page.products')

  return {
    title: t('title'),
  }
}

export default async function Page({
  params,
  searchParams,
}: PageProps<'/[locale]/products'>) {
  const { locale } = await params

  const lang = validateLocale(locale)

  const filters = parseProductFilters(await searchParams)

  const [dlcs, regions, tiers, categories, storageLevels, products] =
    await Promise.all([
      anno.dlc.list({
        lang,
      }),
      anno.regions.list({
        lang,
      }),
      anno.populationTiers.list({
        lang,
      }),
      anno.products.categories({
        lang,
      }),
      anno.products.storageLevels({
        lang,
      }),
      anno.products.list({
        categories: filters.category ?? undefined,
        dlcs: filters.dlcs ?? undefined,
        lang,
        page: filters.page ?? undefined,
        regions: filters.regions ?? undefined,
        storageLevels: filters.storage ?? undefined,
        tiers: filters.tiers ?? undefined,
      }),
    ])

  return (
    <ProductList
      categories={categories}
      dlcs={dlcs}
      filters={filters}
      products={products}
      regions={regions}
      storageLevels={storageLevels}
      tiers={tiers}
    />
  )
}
