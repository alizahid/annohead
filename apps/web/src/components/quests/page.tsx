import { type Quest } from '@anno/db/client'

import { getIcon } from '@/lib/icons'

import { CommentList } from '../comments/list'
import { Icon } from '../common/icon'
import { QuestFlow } from './tree'

type Props = {
  quest: Quest
}

export function QuestPage({ quest }: Props) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          {quest.region?.key || quest.dlc?.key ? (
            <div className="flex gap-4">
              {quest.region?.key ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`region.${quest.region.key}`)}
                />
              ) : null}

              {quest.dlc?.key ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`dlc.${quest.dlc.key}`)}
                />
              ) : null}
            </div>
          ) : null}

          <h1 className="text-4xl leading-tight">{quest.name}</h1>
        </div>

        {quest.icon ? (
          <Icon className="size-50 lg:size-32" icon={quest.icon} />
        ) : null}
      </div>

      <QuestFlow quest={quest} />

      <CommentList guid={quest.guid} />
    </div>
  )
}
