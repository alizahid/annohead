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
      <div className="flex flex-col gap-4">
        <header className="grid grid-cols-[1fr_2.5rem] items-center gap-4">
          <Suspense>
            <SearchBox className="col-span-1" />
          </Suspense>

          <AuthProfile className="col-start-2" />
        </header>

        <Navigation className="col-start-1" />
      </div>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="text-gray-11 text-xs">
        {t('footer.copyright', {
          year: new Date().getFullYear(),
        })}
      </footer>
    </div>
  )
}
