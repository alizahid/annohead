'use client'

import { type SearchType, SearchTypes } from '@anno/db/search'
import { Checkbox } from '@base-ui/react/checkbox'
import { CheckboxGroup } from '@base-ui/react/checkbox-group'
import { CheckIcon } from '@phosphor-icons/react/dist/ssr'
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
      className="flex flex-col gap-2 lg:-mx-4 lg:flex-row lg:gap-0"
      onValueChange={async (next) => {
        await setFilters({
          type: isEqual(sortBy(next), sortBy(SearchTypes))
            ? null
            : (next as Array<SearchType>),
        })

        router.refresh()
      }}
      value={filters.type ?? SearchTypes.map(String)}
    >
      {SearchTypes.map((item) => (
        <label
          className="flex items-center gap-2 font-bold text-sm lg:p-4 lg:text-base"
          htmlFor={`search-type-${item}`}
          key={item}
        >
          <Checkbox.Root
            className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-gray-12 data-checked:bg-gray-12"
            id={`search-type-${item}`}
            name="type"
            value={item}
          >
            <Checkbox.Indicator className="flex data-unchecked:hidden">
              <CheckIcon className="size-3 text-gray-1" weight="bold" />
            </Checkbox.Indicator>
          </Checkbox.Root>

          {t(item)}
        </label>
      ))}
    </CheckboxGroup>
  )
}
