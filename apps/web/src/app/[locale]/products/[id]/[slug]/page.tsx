import { anno } from '@anno/db/client'

import { getId, validateLocale } from '@/lib/validators'

export default async function Page({
  params,
}: PageProps<'/[locale]/products/[id]/[slug]'>) {
  const { locale, id } = await params

  const product = await anno.products.get({
    id: getId(id),
    lang: validateLocale(locale),
  })

  return (
    <pre className="font-mono text-xs">{JSON.stringify(product, null, 2)}</pre>
  )
}
