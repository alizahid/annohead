import { useTranslations } from 'next-intl'
import { type ReactNode, Suspense } from 'react'

import { SearchBox } from '@/components/search/box'

import { AuthCard } from './auth'
import { Navigation } from './navigation'

type Props = {
  children: ReactNode
}

export function MainLayout({ children }: Props) {
  const t = useTranslations('component.layouts.main')

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 bg-gray-1 p-4 md:p-8">
      <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-4">
        <Navigation />

        <Suspense>
          <SearchBox />
        </Suspense>

        <AuthCard />
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
