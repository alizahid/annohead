import { parseISO } from 'date-fns'
import { type Metadata } from 'next'
import { useFormatter, useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { changelog } from '@/lib/changelog'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('page.changelog')

  return {
    title: t('title'),
  }
}

export default function Page() {
  const t = useTranslations('page.changelog')
  const f = useFormatter()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl">{t('header')}</h1>

        <p className="text-gray-11 text-sm tabular-nums">
          {t('updated', {
            updated: parseISO(process.env.LAST_UPDATED),
          })}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {changelog.map((release) => (
          <section className="flex flex-col gap-4" key={String(release.date)}>
            <h3 className="font-bold text-xl tabular-nums">
              {f.dateTime(release.date, {
                dateStyle: 'medium',
              })}
            </h3>

            {(['added', 'changed', 'fixed'] as const).map((section) =>
              release[section] ? (
                <div className="flex flex-col gap-2" key={section}>
                  <h4 className="font-bold text-gray-11 text-sm">
                    {t(section)}
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
  )
}
