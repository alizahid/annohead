import localFont from 'next/font/local'

export const text = localFont({
  display: 'swap',
  src: [
    {
      path: './text-upright.woff2',
      weight: '100 900',
    },
    {
      path: './text-italic.woff2',
      style: 'italic',
      weight: '100 900',
    },
  ],
  variable: '--font-text',
})

export const heading = localFont({
  display: 'swap',
  src: [
    {
      path: './heading-upright.woff2',
      weight: '100 900',
    },
    {
      path: './heading-italic.woff2',
      style: 'italic',
      weight: '100 900',
    },
  ],
  variable: '--font-heading',
})

export const code = localFont({
  display: 'swap',
  src: [
    {
      path: './code-upright.ttf',
      weight: '100 900',
    },
    {
      path: './code-italic.ttf',
      style: 'italic',
      weight: '100 900',
    },
  ],
  variable: '--font-code',
})
