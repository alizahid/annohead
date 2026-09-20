'use client'

import { cn } from 'cn'
import Image from 'next/image'
import { type Locale, useLocale } from 'next-intl'

import { routing } from '@/intl'
import { NavLink, usePathname } from '@/intl/nav'

export function LanguageSelector() {
  const path = usePathname()
  const locale = useLocale()

  return (
    <div className="flex gap-2">
      {routing.locales.map((item) => (
        <NavLink
          className={cn(
            'flex size-10 items-center justify-center rounded-lg outline-none ring-accent-8 focus-visible:ring-2',
            item === locale && 'bg-accent-5',
          )}
          href={path}
          key={item}
          locale={item}
        >
          <Image
            alt={item}
            className="size-6"
            height={16}
            src={`https://flags.willa.app/flags/${flags[item]}.svg`}
            unoptimized
            width={16}
          />
        </NavLink>
      ))}
    </div>
  )
}

const flags: Record<Locale, string> = {
  de: 'de',
  en: 'gb',
}
