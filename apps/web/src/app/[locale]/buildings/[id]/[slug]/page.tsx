import { anno } from '@anno/db/client'

import { getId, validateLocale } from '@/lib/validators'

export default async function Page({
  params,
}: PageProps<'/[locale]/buildings/[id]/[slug]'>) {
  const { locale, id } = await params

  const building = await anno.buildings.get({
    id: getId(id),
    lang: validateLocale(locale),
  })

  return (
    <pre className="font-mono text-xs">{JSON.stringify(building, null, 2)}</pre>
  )
}
