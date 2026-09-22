'use client'

import { cn } from 'cn'
import { useTranslations } from 'next-intl'

import { NavLink, usePathname } from '@/intl/nav'

type Props = {
  className?: string
}

export function Navigation({ className }: Props) {
  const path = usePathname()

  const t = useTranslations('component.layouts.main.nav')

  const sections = [
    {
      href: '/buildings',
      icon: 'building',
      key: 'buildings',
    },
    {
      href: '/chains',
      icon: 'chain',
      key: 'chains',
    },
    {
      href: '/items',
      icon: 'item',
      key: 'items',
    },
    {
      href: '/products',
      icon: 'product',
      key: 'products',
    },
    {
      href: '/quests',
      icon: 'quest',
      key: 'quests',
    },
    {
      href: '/techs',
      icon: 'tech',
      key: 'techs',
    },
  ] as const

  return (
    <nav
      className={cn(
        'flex h-10 items-center gap-4 overflow-x-scroll text-nowrap lg:overflow-x-visible',
        className,
      )}
    >
      {sections.map((section) => (
        <NavLink
          className={cn(
            'rounded-sm font-medium leading-tight outline-none ring-accent-8 ring-offset-4 ring-offset-gray-1 transition-colors hover:text-accent-9 focus-visible:ring-2',
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
