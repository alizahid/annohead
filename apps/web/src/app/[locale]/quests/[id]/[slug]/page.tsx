import { anno } from '@anno/db/client'

import { getId, validateLocale } from '@/lib/validators'

export default async function Page({
  params,
}: PageProps<'/[locale]/quests/[id]/[slug]'>) {
  const { locale, id } = await params

  const quest = await anno.quests.get({
    id: getId(id),
    lang: validateLocale(locale),
  })

  return (
    <pre className="font-mono text-xs">{JSON.stringify(quest, null, 2)}</pre>
  )
}
