'use client'

import { Menu } from '@base-ui/react/menu'
import Image from 'next/image'
import { type Locale, useLocale, useTranslations } from 'next-intl'

import { routing } from '@/intl'
import { NavLink, usePathname } from '@/intl/nav'

export function LanguageSelector() {
  const path = usePathname()
  const locale = useLocale()

  const t = useTranslations('component.layouts.main.language')

  return (
    <Menu.Root>
      <Menu.Trigger className="flex size-10 items-center justify-center rounded-lg outline-none ring-accent-8 focus-visible:ring-2 data-popup-open:rounded-b-none data-popup-open:bg-white dark:data-popup-open:bg-black">
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
        <Menu.Positioner align="end" className="outline-hidden" side="bottom">
          <Menu.Popup className="overflow-hidden rounded-b-lg rounded-tl-lg bg-white outline-hidden dark:bg-black">
            <Menu.RadioGroup value={locale}>
              {routing.locales.map((item) => (
                <Menu.RadioItem
                  className="flex items-center gap-2 p-3 font-medium text-sm leading-tight outline-none data-highlighted:bg-accent-4"
                  key={item}
                  render={<NavLink href={path} locale={item} />}
                  value={item}
                >
                  <Image
                    alt={item}
                    className="size-4"
                    height={16}
                    src={`https://flags.willa.app/flags/${flags[item]}.svg`}
                    unoptimized
                    width={16}
                  />

                  {t(item)}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
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
