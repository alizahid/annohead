import { anno } from '@anno/db/client'

import { SearchItem } from '@/components/search/item'
import { validateLocale } from '@/lib/validators'

export default async function Page({
  params,
  searchParams,
}: PageProps<'/[locale]/search'>) {
  const { locale } = await params
  const { q } = await searchParams

  const { rows } = await anno.search({
    lang: validateLocale(locale),
    query: q ? String(q) : '',
  })

  return (
    <div>
      {rows
        .filter((item) => item.name)
        .map((item) => (
          <SearchItem item={item} key={item.guid} />
        ))}
    </div>
  )
}
