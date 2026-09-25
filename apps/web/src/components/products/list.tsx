import {
  type Dlcs,
  type PopulationTiers,
  type ProductCategories,
  type ProductStorageLevels,
  type Products,
  type Regions,
} from '@anno/db/client'
import { useTranslations } from 'next-intl'

import { type ProductFilters } from '@/lib/validators'

import { Empty } from '../common/empty'
import { Pagination } from '../common/pagination'
import { ProductCard } from './card'
import { ProductFiltersCard } from './filters'

type Props = {
  categories: ProductCategories
  dlcs: Dlcs
  filters: ProductFilters
  products: Products
  regions: Regions
  storageLevels: ProductStorageLevels
  tiers: PopulationTiers
}

export function ProductList({
  categories,
  dlcs,
  filters,
  products,
  regions,
  storageLevels,
  tiers,
}: Props) {
  const t = useTranslations('component.products.list')

  return (
    <div className="flex flex-1 flex-col gap-12">
      <h1 className="text-4xl">{t('title')}</h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <ProductFiltersCard
          categories={categories}
          dlcs={dlcs}
          regions={regions}
          storageLevels={storageLevels}
          tiers={tiers}
        />

        <div className="flex flex-1 flex-col gap-12">
          {products.rows.length ? (
            <div className="grid items-start gap-4 sm:grid-cols-2 md:grid-cols-3">
              {products.rows.map((product) => (
                <ProductCard key={product.guid} product={product} />
              ))}
            </div>
          ) : (
            <Empty>{t('empty')}</Empty>
          )}

          <Pagination page={filters.page} pages={products.pages} />
        </div>
      </div>
    </div>
  )
}
