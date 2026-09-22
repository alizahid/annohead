'use client'

import { type SearchType, SearchTypes } from '@anno/db/search'
import { Checkbox } from '@base-ui/react/checkbox'
import { CheckboxGroup } from '@base-ui/react/checkbox-group'
import { isEqual, sortBy } from 'lodash'
import { useTranslations } from 'next-intl'
import { useQueryStates } from 'nuqs'

import { useRouter } from '@/intl/nav'
import { searchFilters } from '@/lib/validators'

export function SearchFiltersCard() {
  const router = useRouter()

  const t = useTranslations('component.search.filters')

  const [filters, setFilters] = useQueryStates(searchFilters)

  return (
    <CheckboxGroup
      className="flex flex-col gap-2 lg:flex-row"
      onValueChange={async (next) => {
        await setFilters({
          page: null,
          type: isEqual(sortBy(next), sortBy(SearchTypes))
            ? null
            : (next as Array<SearchType>),
        })

        router.refresh()
      }}
      value={filters.type ?? SearchTypes.map(String)}
    >
      {SearchTypes.map((item) => (
        <Checkbox.Root
          className="flex h-10 items-center gap-2 rounded-md px-2 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2 data-checked:bg-accent-5"
          key={item}
          value={item}
        >
          <Checkbox.Indicator
            className="flex size-6 items-center justify-center rounded-full border border-gray-12 data-checked:border-0 data-checked:bg-gray-12"
            keepMounted
          />

          <span className="font-bold">{t(item)}</span>
        </Checkbox.Root>
      ))}
    </CheckboxGroup>
  )
}
