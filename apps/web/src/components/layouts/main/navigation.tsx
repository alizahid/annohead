'use client'

import { cn } from 'cn'
import { useTranslations } from 'next-intl'

import { NavLink, usePathname } from '@/intl/nav'
import { navigation } from '@/lib/url'

type Props = {
  className?: string
}

export function Navigation({ className }: Props) {
  const path = usePathname()

  const t = useTranslations('component.layouts.main.nav')

  return (
    <nav
      className={cn(
        '-m-1 flex items-center overflow-x-scroll text-nowrap p-1 lg:justify-center lg:overflow-x-visible',
        className,
      )}
    >
      {navigation.map((section) => (
        <NavLink
          className={cn(
            'flex h-10 items-center rounded-lg px-3 font-medium leading-tight outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2',
            path.startsWith(section.href) && 'text-accent-11',
          )}
          href={section.href}
          key={section.key}
        >
          {t(section.key)}
        </NavLink>
      ))}
    </nav>
  )
}
