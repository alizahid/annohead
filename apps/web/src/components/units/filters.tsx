'use client'

import { type Regions, type UnitTypes } from '@anno/db/client'
import { Checkbox } from '@base-ui/react/checkbox'
import { CheckboxGroup } from '@base-ui/react/checkbox-group'
import { useTranslations } from 'next-intl'
import { useQueryStates } from 'nuqs'

import { useRouter } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { unitFilters } from '@/lib/validators'

import { Icon } from '../common/icon'

type Props = {
  types: UnitTypes
  regions: Regions
}

export function UnitFiltersCard({ types, regions }: Props) {
  const router = useRouter()

  const t = useTranslations('component.units.filters')

  const [filters, setFilters] = useQueryStates(unitFilters)

  return (
    <div className="grid gap-8 md:grid-cols-4 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col gap-4">
        <h3>{t('regions')}</h3>

        <CheckboxGroup
          className="flex flex-col gap-2"
          onValueChange={async (next) => {
            await setFilters({
              page: null,
              regions: next.map(Number),
            })

            router.refresh()
          }}
          value={filters.regions ? filters.regions.map(String) : []}
        >
          {regions.map((item) => (
            <Checkbox.Root
              className="flex h-8 items-center gap-2 rounded-md px-1 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2 data-checked:bg-accent-5"
              key={item.id}
              value={String(item.id)}
            >
              {item.key ? (
                <Icon className="size-6" icon={getIcon(`region.${item.key}`)} />
              ) : null}

              <span className="font-bold text-sm">{item.name}</span>
            </Checkbox.Root>
          ))}
        </CheckboxGroup>
      </div>

      <div className="flex flex-col gap-4">
        <h3>{t('types')}</h3>

        <CheckboxGroup
          className="flex flex-col gap-2"
          onValueChange={async (next) => {
            await setFilters({
              page: null,
              types: next.map(Number),
            })

            router.refresh()
          }}
          value={filters.types ? filters.types.map(String) : []}
        >
          {types.map((item) => (
            <Checkbox.Root
              className="flex h-8 items-center gap-2 rounded-md px-1 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2 data-checked:bg-accent-5"
              key={item.guid}
              value={String(item.guid)}
            >
              {item.icon ? (
                <Icon className="size-6" icon={item.icon} />
              ) : (
                <Checkbox.Indicator
                  className="ml-0.5 flex size-5 items-center justify-center rounded-full border border-gray-12 data-checked:border-0 data-checked:bg-gray-12"
                  keepMounted
                />
              )}

              <span className="font-bold text-sm">{item.name}</span>
            </Checkbox.Root>
          ))}
        </CheckboxGroup>
      </div>
    </div>
  )
}
