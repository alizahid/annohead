'use client'

import {
  type Dlcs,
  type ItemNiches,
  type ItemRarities,
  type ItemTypes,
} from '@anno/db/client'
import { type Allocation, type Niche, type Rarity } from '@anno/db/enums'
import { Checkbox } from '@base-ui/react/checkbox'
import { CheckboxGroup } from '@base-ui/react/checkbox-group'
import { useTranslations } from 'next-intl'
import { useQueryStates } from 'nuqs'

import { useRouter } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { itemFilters } from '@/lib/validators'

import { Icon } from '../common/icon'

type Props = {
  types: ItemTypes
  dlcs: Dlcs
  niches: ItemNiches
  rarities: ItemRarities
}

export function ItemFiltersCard({ types, dlcs, niches, rarities }: Props) {
  const router = useRouter()

  const t = useTranslations('component.items.filters')

  const [filters, setFilters] = useQueryStates(itemFilters)

  return (
    <div className="grid gap-8 md:grid-cols-4 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col gap-4">
        <h3>{t('dlcs')}</h3>

        <CheckboxGroup
          className="flex flex-col gap-2"
          onValueChange={async (next) => {
            await setFilters({
              dlcs: next.map(Number),
              page: null,
            })

            router.refresh()
          }}
          value={filters.dlcs ? filters.dlcs.map(String) : []}
        >
          {dlcs.map((item) => (
            <Checkbox.Root
              className="flex h-8 items-center gap-2 rounded-md px-1 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2 data-checked:bg-accent-5"
              key={item.guid}
              value={String(item.guid)}
            >
              {item.icon ? <Icon className="size-6" icon={item.icon} /> : null}

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
              types: next as Array<Allocation>,
            })

            router.refresh()
          }}
          value={filters.types ? filters.types.map(String) : []}
        >
          {types.map((item) => (
            <Checkbox.Root
              className="flex h-8 items-center gap-2 rounded-md px-1 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2 data-checked:bg-accent-5"
              key={item.key}
              value={item.key}
            >
              <Icon className="size-6" icon={getIcon(`type.${item.key}`)} />

              <span className="font-bold text-sm">{item.name}</span>
            </Checkbox.Root>
          ))}
        </CheckboxGroup>
      </div>

      <div className="flex flex-col gap-4">
        <h3>{t('niches')}</h3>

        <CheckboxGroup
          className="flex flex-col gap-2"
          onValueChange={async (next) => {
            await setFilters({
              niches: next as Array<Niche>,
              page: null,
            })

            router.refresh()
          }}
          value={filters.niches ? filters.niches.map(String) : []}
        >
          {niches.map((item) => (
            <Checkbox.Root
              className="flex h-8 items-center gap-2 rounded-md px-1 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2 data-checked:bg-accent-5"
              key={item.key}
              value={item.key}
            >
              <Icon className="size-6" icon={getIcon(`niche.${item.key}`)} />

              <span className="font-bold text-sm">{item.name}</span>
            </Checkbox.Root>
          ))}
        </CheckboxGroup>
      </div>

      <div className="flex flex-col gap-4">
        <h3>{t('rarities')}</h3>

        <CheckboxGroup
          className="flex flex-col gap-2"
          onValueChange={async (next) => {
            await setFilters({
              page: null,
              rarities: next as Array<Rarity>,
            })

            router.refresh()
          }}
          value={filters.rarities ? filters.rarities.map(String) : []}
        >
          {rarities.map((item) => (
            <Checkbox.Root
              className="flex h-8 items-center gap-2 rounded-md px-1 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2 data-checked:bg-accent-5"
              key={item.key}
              value={item.key}
            >
              <Checkbox.Indicator
                className="ml-0.5 flex size-5 items-center justify-center rounded-full border border-gray-12 data-checked:border-0 data-checked:bg-gray-12"
                keepMounted
              />

              <span className="font-bold text-sm">{item.name}</span>
            </Checkbox.Root>
          ))}
        </CheckboxGroup>
      </div>
    </div>
  )
}
