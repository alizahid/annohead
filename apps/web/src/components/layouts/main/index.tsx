import { useTranslations } from 'next-intl'
import { type ReactNode, Suspense } from 'react'

import { AuthProfile } from '@/components/auth/profile'
import { Logo } from '@/components/common/logo'
import { SearchBox } from '@/components/search/box'

import { LanguageSelector } from './language-selector'
import { Navigation } from './navigation'

type Props = {
  children: ReactNode
}

export function MainLayout({ children }: Props) {
  const t = useTranslations('component.layouts.main')

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 p-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Logo className="hidden h-8 shrink-0 md:block" />

          <Navigation className="flex-1" />

          <LanguageSelector />

          <AuthProfile />
        </div>

        <Suspense>
          <SearchBox />
        </Suspense>
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
