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
        '-m-1 flex items-center overflow-x-scroll text-nowrap p-1 lg:justify-center lg:overflow-x-visible',
        className,
      )}
    >
      {sections.map((section) => (
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
