import { useTranslations } from 'next-intl'
import { type ReactNode } from 'react'

import { SearchBox } from '@/components/search/box'

import { LanguageSelector } from './language-selector'
import { Navigation } from './navigation'

type Props = {
  children: ReactNode
}

export function MainLayout({ children }: Props) {
  const t = useTranslations('component.layouts.main')

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 bg-gray-1 p-4 md:p-8">
      <header className="flex justify-between gap-4 md:flex-row md:items-center">
        <Navigation />

        <SearchBox className="flex-1" />

        <LanguageSelector />
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="text-gray-11 text-xs">
        {t('footer.copyright', {
          year: new Date().getFullYear(),
        })}
      </footer>
    </div>
  )
}
