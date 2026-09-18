import { anno } from '@anno/db/client'

import { getId, validateLocale } from '@/lib/validators'

export default async function Page({
  params,
}: PageProps<'/[locale]/techs/[id]/[slug]'>) {
  const { locale, id } = await params

  const tech = await anno.techs.get({
    id: getId(id),
    lang: validateLocale(locale),
  })

  return (
    <pre className="font-mono text-xs">{JSON.stringify(tech, null, 2)}</pre>
  )
}
