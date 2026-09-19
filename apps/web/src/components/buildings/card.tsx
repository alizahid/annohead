import { type Building } from '@anno/db/client'
import { kebabCase } from 'lodash'
import { useTranslations } from 'next-intl'

import { Link } from '@/intl/nav'
import { getDlcIcon, getIcon } from '@/lib/icons'

import { Icon } from '../common/icon'

type Props = {
  building: Building
}

export function BuildingCard({ building }: Props) {
  const t = useTranslations('component.buildings.card')

  const icon = getDlcIcon(building.dlcGuid)

  return (
    <Link
      className="relative flex flex-col gap-4 rounded-lg p-4 outline-none ring-accent-8 hover:bg-accent-4 focus-visible:ring-2"
      href={`/buildings/${building.guid}/${kebabCase(building.name ?? 'building')}`}
    >
      {building.icon ? <Icon className="size-16" icon={building.icon} /> : null}

      <div className="flex flex-col">
        <div className="font-bold">{building.name}</div>

        {building.kind ? (
          <div className="text-gray-11 text-sm">
            {t(`kind.${building.kind}`)}
          </div>
        ) : null}

        {icon || building.region?.key ? (
          <div className="pointer-events-none absolute top-4 right-4 flex gap-2">
            {icon ? <Icon className="size-6" icon={getIcon(icon)} /> : null}

            {building.region?.key ? (
              <Icon className="size-6" icon={getIcon(building.region.key)} />
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
