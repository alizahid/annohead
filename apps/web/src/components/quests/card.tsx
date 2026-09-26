import { type Quests } from '@anno/db/client'

import { NavLink } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  quest: Quests['rows'][number]
}

export function QuestCard({ quest }: Props) {
  return (
    <NavLink
      className="relative flex flex-col gap-4 rounded-lg p-4 outline-none ring-accent-8 hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl('quest', quest.guid, quest.slug)}
    >
      <Icon
        className="size-16"
        icon={
          quest.icon && !quest.icon.includes('icon_2d_mark_question')
            ? quest.icon
            : getIcon('common.quest')
        }
      />

      <div className="font-bold">{quest.name}</div>

      {quest.region?.key || quest.dlc?.key ? (
        <div className="pointer-events-none absolute top-4 right-4 flex gap-2">
          {quest.region?.key ? (
            <Icon
              className="size-6"
              icon={getIcon(`region.${quest.region.key}`)}
            />
          ) : null}

          {quest.dlc?.key ? (
            <Icon className="size-6" icon={getIcon(`dlc.${quest.dlc.key}`)} />
          ) : null}
        </div>
      ) : null}
    </NavLink>
  )
}
