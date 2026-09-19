'use client'

import { cn } from 'cn'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { Tooltip } from '@/components/common/tooltip'
import { Link } from '@/intl/nav'
import { getIcon } from '@/lib/icons'

type Props = {
  className?: string
}

export function Navigation({ className }: Props) {
  const t = useTranslations('component.layouts.main.nav')

  const [open, setOpen] = useState(false)

  useHotkeys(
    'esc',
    () => {
      setOpen(false)
    },
    {
      enabled: open,
    },
  )

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
    <nav className={cn('flex gap-2', className)}>
      {sections.map((section) => (
        <Tooltip
          content={t(section.key)}
          key={section.key}
          render={
            <Link
              className="flex size-10 items-center justify-center gap-4 rounded-sm outline-none ring-accent-8 focus-visible:ring-2"
              href={section.href}
            />
          }
        >
          <Image
            alt={section.key}
            className="size-6 invert dark:invert-0"
            height={16}
            src={getIcon(section.icon)}
            width={16}
          />
        </Tooltip>
      ))}
    </nav>
  )
}
