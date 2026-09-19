import { type SearchHit } from '@anno/db/client'
import { type SearchType } from '@anno/db/search'
import { cn } from 'cn'
import { range } from 'lodash'
import { useTranslations } from 'next-intl'

import { Link } from '@/intl/nav'

import { SearchItem } from './item'

type Props = {
  hits: Array<SearchHit>
  page?: number
  pages: number
  query: string
  total: number
  type?: SearchType
}

export function SearchPage({ hits, page, pages, query, total, type }: Props) {
  const t = useTranslations('component.search.page')

  const pagination = getPagination(pages)

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl">{t('title')}</h1>

        {total > 0 ? (
          <span className="tabular-nums">
            {t('results', {
              total,
            })}
          </span>
        ) : null}
      </div>

      {hits.length ? (
        <div className="flex flex-col gap-2">
          {hits.map((item) => (
            <SearchItem item={item} key={item.guid} />
          ))}
        </div>
      ) : (
        <p>
          {t('empty', {
            query,
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

            if (query) {
              params.set('q', query)
            }

            if (type) {
              params.set('t', type)
            }

            if (index > 1) {
              params.set('p', String(index))
            }

            return (
              <Link
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg bg-accent-3 text-sm tabular-nums',
                  index === page && 'bg-accent-5',
                  index === 1 && !page && 'bg-accent-5',
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
