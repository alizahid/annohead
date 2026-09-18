import localFont from 'next/font/local'

export const text = localFont({
  display: 'swap',
  src: [
    {
      path: './text.woff2',
      weight: '400',
    },
    {
      path: './text-bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-text',
})

export const heading = localFont({
  display: 'swap',
  src: [
    {
      path: './heading.woff2',
      weight: '400',
    },
    {
      path: './heading-bold.woff2',
      weight: '900',
    },
  ],
  variable: '--font-heading',
})
