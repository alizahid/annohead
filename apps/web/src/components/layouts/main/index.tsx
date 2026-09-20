import { useTranslations } from 'next-intl'
import { type ReactNode, Suspense } from 'react'

import { AuthProfile } from '@/components/auth/profile'
import { SearchBox } from '@/components/search/box'

import { Navigation } from './navigation'

type Props = {
  children: ReactNode
}

export function MainLayout({ children }: Props) {
  const t = useTranslations('component.layouts.main')

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 bg-gray-1 p-4 md:p-8">
      <header className="grid grid-cols-[1fr_2.5rem] items-center gap-4 lg:grid-cols-[17.5rem_1fr_2.5rem]">
        <Navigation className="col-start-1" />

        <Suspense>
          <SearchBox className="col-span-2 row-start-2 lg:col-span-1 lg:row-auto" />
        </Suspense>

        <AuthProfile className="col-start-2 lg:col-start-3" />
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
