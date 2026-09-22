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
    <nav className={cn('flex gap-4 overflow-x-scroll text-nowrap', className)}>
      {sections.map((section) => (
        <NavLink
          className={cn(
            'rounded-lg p-2 font-medium text-md leading-none outline-none focus-visible:bg-accent-4',
            path.startsWith(section.href) &&
              'bg-accent-9 font-bold text-accent-contrast',
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
