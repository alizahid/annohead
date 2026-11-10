import { type Quest } from '@anno/db/client'
import { type QuestCarry } from '@anno/db/walk'

import { CommentList } from '../comments/list'
import { Icon } from '../common/icon'
import { DlcCard } from '../shared/dlc'
import { RegionCard } from '../shared/region'
import { QuestFlow } from './tree'

type Props = {
  carry: QuestCarry
  played: Array<number>
  quest: NonNullable<Quest>
}

export function QuestPage({ carry, played, quest }: Props) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          {quest.region?.key || quest.dlc?.key ? (
            <div className="flex gap-4">
              <RegionCard region={quest.region?.key} />

              <DlcCard dlc={quest.dlc?.key} />
            </div>
          ) : null}

          <h1 className="text-4xl leading-tight">{quest.name}</h1>
        </div>

        {quest.icon ? (
          <Icon className="size-50 lg:size-32" icon={quest.icon} />
        ) : null}
      </div>

      <QuestFlow carry={carry} played={played} quest={quest} />

      <CommentList guid={quest.guid} />
    </div>
  )
}
