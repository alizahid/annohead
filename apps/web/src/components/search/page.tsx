import { type SearchResults } from '@anno/db/client'
import { cn } from 'cn'
import { range } from 'lodash'
import { useTranslations } from 'next-intl'

import { Link } from '@/intl/nav'
import { type SearchFilters } from '@/lib/validators'

import { SearchFiltersCard } from './filters'
import { SearchItem } from './item'

type Props = {
  data: SearchResults
  filters: SearchFilters
}

export function SearchPage({ data, filters }: Props) {
  const t = useTranslations('component.search.page')

  const pagination = getPagination(data.pages)

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl">{t('title')}</h1>

          {data.total > 0 ? (
            <span className="tabular-nums">
              {t('results', {
                total: data.total,
              })}
            </span>
          ) : null}
        </div>

        <SearchFiltersCard />
      </div>

      {data.rows.length ? (
        <div className="flex flex-col gap-2">
          {data.rows.map((item) => (
            <SearchItem item={item} key={item.guid} />
          ))}
        </div>
      ) : (
        <p>
          {t('empty', {
            query: filters.query,
          })}
        </p>
      )}

      {pagination.length ? (
        <div className="flex justify-center gap-2">
          {pagination.map((index) => {
            if (index === null) {
              return (
                <div
                  className="pointer-events-none flex size-8 items-center justify-center rounded-lg bg-accent-2 text-sm"
                  key="separator"
                >
                  &#8230;
                </div>
              )
            }

            const params = new URLSearchParams()

            if (filters.query) {
              params.set('query', filters.query)
            }

            if (filters.type) {
              params.delete('type')

              for (const item of filters.type) {
                params.append('type', item)
              }
            }

            if (index > 1) {
              params.set('page', String(index))
            }

            return (
              <Link
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg bg-accent-3 text-sm tabular-nums',
                  index === filters.page && 'bg-accent-5',
                  index === 1 && !filters.page && 'bg-accent-5',
                )}
                href={`/search?${params}`}
                key={index}
              >
                {index}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function getPagination(pages: number) {
  const pagination = range(1, pages + 1)

  if (pagination.length > 10) {
    return [...pagination.slice(0, 3), null, ...pagination.slice(-3)]
  }

  return pagination
}
