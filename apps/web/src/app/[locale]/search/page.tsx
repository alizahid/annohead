import { anno } from '@anno/db/client'

import { SearchItem } from '@/components/search/item'
import { validateLocale, validateSearchType } from '@/lib/validators'

export default async function Page({
  params,
  searchParams,
}: PageProps<'/[locale]/search'>) {
  const { locale } = await params
  const { q, t } = await searchParams

  const type = validateSearchType(t)

  const { rows } = await anno.search({
    lang: validateLocale(locale),
    query: q ? String(q) : '',
    type: type ? [type] : undefined,
  })

  return (
    <div className="flex flex-col gap-2">
      {rows
        .filter((item) => item.name)
        .map((item) => (
          <SearchItem item={item} key={item.guid} />
        ))}
    </div>
  )
}
