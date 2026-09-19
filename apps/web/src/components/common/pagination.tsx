'use client'

import { cn } from 'cn'
import { range } from 'lodash'
import { useSearchParams } from 'next/navigation'

import { Link, usePathname } from '@/intl/nav'

type Props = {
  page: number | null
  pages: number
}

export function Pagination({ page, pages }: Props) {
  const path = usePathname()
  const search = useSearchParams()

  console.log('path', path)
  console.log('search', search)

  const pagination = getPagination(pages)

  if (pagination.length > 1) {
    return (
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

          const params = new URLSearchParams(search)

          if (index > 1) {
            params.set('page', String(index))
          }

          return (
            <Link
              className={cn(
                'flex size-8 items-center justify-center rounded-lg bg-accent-3 text-sm tabular-nums',
                index === page && 'bg-accent-5',
                index === 1 && !page && 'bg-accent-5',
              )}
              href={`${path}?${params}`}
              key={index}
            >
              {index}
            </Link>
          )
        })}
      </div>
    )
  }

  return null
}

function getPagination(pages: number) {
  const pagination = range(1, pages + 1)

  if (pagination.length > 10) {
    return [...pagination.slice(0, 3), null, ...pagination.slice(-3)]
  }

  return pagination
}
