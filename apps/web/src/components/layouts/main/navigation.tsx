'use client'

import { ListIcon, XIcon } from '@phosphor-icons/react/ssr'
import { cn } from 'cn'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { Link } from '@/intl/nav'
import { getIcon } from '@/lib/icons'

import { LanguageSelector } from './language-selector'

export function Navigation() {
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
    <>
      <div className="flex size-10">
        <button
          className={cn(
            'flex size-10 items-center justify-center rounded-lg outline-none ring-accent-8 focus-visible:ring-2',
            open &&
              'lg:-translate-2 fixed top-4 left-4 z-50 lg:top-8 lg:left-1/2',
          )}
          onClick={() => {
            setOpen((previous) => !previous)
          }}
          type="button"
        >
          {open ? (
            <XIcon className="size-6" />
          ) : (
            <ListIcon className="size-6" />
          )}
        </button>
      </div>

      <nav
        className={cn(
          'fixed inset-0 z-40 flex flex-col items-start justify-center gap-8 bg-gray-1/80 p-8 text-2xl transition-opacity',
          !open && 'pointer-events-none opacity-0',
        )}
      >
        {sections.map((section) => (
          <Link
            className="flex items-center gap-4 rounded-sm leading-tight outline-accent-8 outline-offset-8"
            href={section.href}
            key={section.key}
            tabIndex={open ? 0 : -1}
          >
            <Image
              alt={section.key}
              className="size-8"
              height={16}
              src={getIcon(section.icon)}
              unoptimized
              width={16}
            />

            <span className="flex-1 font-bold">{t(section.key)}</span>
          </Link>
        ))}

        <LanguageSelector />
      </nav>
    </>
  )
}
