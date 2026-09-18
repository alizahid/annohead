'use client'

import { cn } from 'cn'
import { useTranslations } from 'next-intl'
import { useQueryState } from 'nuqs'

type Props = {
  className?: string
}

export function SearchBox({ className }: Props) {
  const t = useTranslations('component.search.box')

  const [query] = useQueryState('q')

  return (
    <form action="/search" className={cn('flex justify-center', className)}>
      <input
        className="h-10 w-full max-w-3xs appearance-none rounded-full bg-gray-3 px-4 outline-none ring-accent-9 focus-visible:ring-2"
        defaultValue={query ?? undefined}
        name="q"
        placeholder={t('placeholder')}
        type="search"
      />
    </form>
  )
}
