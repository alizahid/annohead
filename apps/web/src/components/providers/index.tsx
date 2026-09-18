import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'

import { ConvexProvider } from './convex'

type Props = {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <NuqsAdapter>
      <NextIntlClientProvider>
        <ConvexProvider>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </ConvexProvider>
      </NextIntlClientProvider>
    </NuqsAdapter>
  )
}
