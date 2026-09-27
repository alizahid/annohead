import Image from 'next/image'
import { useFormatter, useTranslations } from 'next-intl'

import { Icon } from '@/components/common/icon'
import { routing } from '@/intl'
import { flags, names } from '@/intl/data'
import { NavLink } from '@/intl/nav'
import { changelog } from '@/lib/changelog'
import { getIcon } from '@/lib/icons'
import { navigation } from '@/lib/url'

export default function Home() {
  const t = useTranslations('page.landing')
  const tNav = useTranslations('component.layouts.main.nav')
  const f = useFormatter()

  return (
    <div className="my-12 flex flex-col gap-24 md:flex-row">
      <div className="flex flex-col gap-6">
        <h2 className="text-4xl">{t('database')}</h2>

        <div className="flex flex-col items-start gap-2">
          {navigation.map((section) => (
            <NavLink
              className="flex items-center gap-4 rounded-lg p-2 pr-3 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2"
              href={section.href}
              key={section.key}
            >
              <Icon className="size-6" icon={getIcon(`ui.${section.key}`)} />

              <span className="font-bold">{tNav(section.key)}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-4xl">{t('language')}</h2>

        <div className="flex flex-col items-start gap-2">
          {routing.locales.map((item) => (
            <NavLink
              className="flex items-center gap-4 rounded-lg p-2 pr-3 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2"
              href="/"
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

              <span className="font-bold">{names[item]}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <h2 className="text-4xl">{t('changelog.title')}</h2>

        <div className="flex flex-col gap-8">
          {changelog.map((release) => (
            <section className="flex flex-col gap-4" key={String(release.date)}>
              <h3 className="font-bold text-xl">
                {f.dateTime(release.date, {
                  dateStyle: 'medium',
                })}
              </h3>

              {sections.map((section) =>
                release[section] ? (
                  <div className="flex flex-col gap-2" key={section}>
                    <h4 className="font-bold text-gray-11 text-sm">
                      {t(`changelog.${section}`)}
                    </h4>

                    <ul className="ml-4 flex list-disc flex-col gap-1">
                      {release[section].map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

const sections = ['added', 'changed', 'fixed'] as const
