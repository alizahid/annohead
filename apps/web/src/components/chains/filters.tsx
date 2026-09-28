'use client'

import { type ChainTypes, type Dlcs, type Regions } from '@anno/db/client'
import { useTranslations } from 'next-intl'
import { useQueryStates } from 'nuqs'

import { getIcon } from '@/lib/icons'
import { chainFilters } from '@/lib/validators'

import { FiltersCard } from '../common/filters'

type Props = {
  dlcs: Dlcs
  refresh?: boolean
  regions: Regions
  types: ChainTypes
}

export function ChainFiltersCard({ dlcs, refresh, regions, types }: Props) {
  const t = useTranslations('component.chains.filters')

  const filters = useQueryStates(chainFilters)

  return (
    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:w-64 lg:flex-col">
      <FiltersCard
        filters={filters}
        id="regions"
        items={regions.map((item) => ({
          icon: item.key ? getIcon(`region.${item.key}`) : null,
          label: item.name,
          value: item.id,
        }))}
        refresh={refresh}
        title={t('regions')}
      />

      <FiltersCard
        filters={filters}
        id="dlcs"
        items={dlcs.map((item) => ({
          icon: item.icon,
          label: item.name,
          value: item.guid,
        }))}
        refresh={refresh}
        title={t('dlcs')}
      />

      <FiltersCard
        filters={filters}
        id="types"
        items={types.map((item) => ({
          icon: item.icon,
          label: item.name,
          value: item.guid,
        }))}
        refresh={refresh}
        title={t('types')}
      />
    </div>
  )
}
