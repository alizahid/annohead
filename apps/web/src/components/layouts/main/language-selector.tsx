'use client'

import { Menu } from '@base-ui/react/menu'
import Image from 'next/image'
import { type Locale, useLocale } from 'next-intl'

import { routing } from '@/intl'
import { Link, usePathname } from '@/intl/nav'

export function LanguageSelector() {
  const path = usePathname()
  const locale = useLocale()

  return (
    <Menu.Root>
      <Menu.Trigger className="flex size-10 items-center justify-center rounded-lg outline-none ring-accent-8 focus-visible:ring-2 data-popup-open:bg-accent-3">
        <Image
          alt={locale}
          className="size-6"
          height={16}
          src={`https://flags.willa.app/flags/${flags[locale]}.svg`}
          unoptimized
          width={16}
        />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner className="outline-none" sideOffset={-40}>
          <Menu.Popup className="rounded-lg bg-accent-3 outline-none">
            {routing.locales.map((item) => (
              <Menu.LinkItem
                className="flex size-10 items-center justify-center rounded-lg outline-none ring-accent-8 focus-visible:ring-2"
                key={item}
                render={<Link href={path} locale={item} />}
              >
                <Image
                  alt={item}
                  className="size-6"
                  height={16}
                  src={`https://flags.willa.app/flags/${flags[item]}.svg`}
                  unoptimized
                  width={16}
                />
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

const flags: Record<Locale, string> = {
  de: 'de',
  en: 'gb',
}
