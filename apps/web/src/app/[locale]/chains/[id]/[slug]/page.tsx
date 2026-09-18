import { anno } from '@anno/db/client'

import { getId, validateLocale } from '@/lib/validators'

export default async function Page({
  params,
}: PageProps<'/[locale]/chains/[id]/[slug]'>) {
  const { locale, id } = await params

  const chain = await anno.chains.get({
    id: getId(id),
    lang: validateLocale(locale),
  })

  return (
    <pre className="font-mono text-xs">{JSON.stringify(chain, null, 2)}</pre>
  )
}
