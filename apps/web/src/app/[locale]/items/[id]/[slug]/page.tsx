import { anno } from '@anno/db/client'

import { getId, validateLocale } from '@/lib/validators'

export default async function Page({
  params,
}: PageProps<'/[locale]/items/[id]/[slug]'>) {
  const { locale, id } = await params

  const item = await anno.items.get({
    id: getId(id),
    lang: validateLocale(locale),
  })

  return (
    <pre className="font-mono text-xs">{JSON.stringify(item, null, 2)}</pre>
  )
}
