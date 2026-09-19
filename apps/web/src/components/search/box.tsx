'use client'

import { Input } from '@base-ui/react/input'
import { cn } from 'cn'
import Form from 'next/form'
import { useTranslations } from 'next-intl'
import { useQueryStates } from 'nuqs'
import { useRef } from 'react'

import { searchFilters } from '@/lib/validators'

type Props = {
  className?: string
}

export function SearchBox({ className }: Props) {
  const t = useTranslations('component.search.box')

  const form = useRef<HTMLFormElement>(null)

  const [filters] = useQueryStates(searchFilters)

  return (
    <Form
      action="/search"
      className={cn('flex justify-center gap-4', className)}
      ref={form}
    >
      <Input
        className="h-10 w-full rounded-lg bg-gray-3 px-3 outline-none ring-accent-8 focus-visible:ring-2"
        defaultValue={filters.query ?? ''}
        name="query"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            form.current?.submit()
          }
        }}
        placeholder={t('placeholder')}
        type="search"
      />
    </Form>
  )
}
