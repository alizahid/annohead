import { useTranslations } from 'next-intl'
import { type ReactNode, Suspense } from 'react'

import { AuthProfile } from '@/components/auth/profile'
import { Logo } from '@/components/common/logo'
import { SearchBox } from '@/components/search/box'

import { Navigation } from './navigation'

type Props = {
  children: ReactNode
}

export function MainLayout({ children }: Props) {
  const t = useTranslations('component.layouts.main')

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 p-6">
      <div className="flex flex-col gap-4">
        <div className="col-start-1 flex items-center gap-4">
          <Logo className="h-8" />

          <Navigation className="flex-1" />
        </div>

        <header className="grid grid-cols-[1fr_2.5rem] items-center gap-4">
          <Suspense>
            <SearchBox className="col-span-1" />
          </Suspense>

          <AuthProfile className="col-start-2" />
        </header>
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
