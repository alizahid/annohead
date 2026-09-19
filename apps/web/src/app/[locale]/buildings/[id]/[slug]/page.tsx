import { anno } from '@anno/db/client'

import { CommentList } from '@/components/comments/list'
import { getId, validateLocale } from '@/lib/validators'

export default async function Page({
  params,
}: PageProps<'/[locale]/buildings/[id]/[slug]'>) {
  const { locale, id } = await params

  const guid = getId(id)

  const building = await anno.buildings.get({
    id: guid,
    lang: validateLocale(locale),
  })

  return (
    <div className="flex flex-col gap-8">
      <pre className="font-mono text-xs">
        {JSON.stringify(building, null, 2)}
      </pre>

      <CommentList guid={guid} />
    </div>
  )
}
