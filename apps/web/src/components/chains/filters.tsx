'use client'

import { type ChainTypes, type Dlcs, type Regions } from '@anno/db/client'
import { useTranslations } from 'next-intl'
import { useQueryStates } from 'nuqs'

import { getIcon } from '@/lib/icons'
import { chainFilters } from '@/lib/validators'

import { FiltersCard } from '../common/filters'

type Props = {
  dlcs: Dlcs
  types: ChainTypes
  regions: Regions
}

export function ChainFiltersCard({ dlcs, types, regions }: Props) {
  const t = useTranslations('component.chains.filters')

  const filters = useQueryStates(chainFilters)

  return (
    <div className="grid gap-8 md:grid-cols-4 lg:flex lg:w-64 lg:flex-col">
      <FiltersCard
        filters={filters}
        id="regions"
        items={regions.map((item) => ({
          icon: item.key ? getIcon(`region.${item.key}`) : null,
          label: item.name,
          value: item.id,
        }))}
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
        title={t('types')}
      />
    </div>
  )
}
