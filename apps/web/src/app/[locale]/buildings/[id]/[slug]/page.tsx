import { anno } from '@anno/db/client'
import { notFound } from 'next/navigation'

import { BuildingItem } from '@/components/buildings/item'
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

  if (!building) {
    notFound()
  }

  return <BuildingItem building={building} />
}
