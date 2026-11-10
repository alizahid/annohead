import { type QuestOutcome } from '@anno/db/client'
import { type Node, type NodeProps } from '@xyflow/react'
import { cn } from 'cn'
import { useTranslations } from 'next-intl'

import { getQuestUrl } from '@/lib/url'

import { DataList } from '../../data-list'
import { QuestHandle } from './handle'
import { usePath } from './path'

export type FollowNode = Node<
  {
    quest: QuestOutcome
  },
  'follow'
>

/** The quest an option starts next: the way on to its page */
export function QuestFollowNode({
  data: { quest },
  id,
}: NodeProps<FollowNode>) {
  const t = useTranslations('component.quests.choice')
  const { off, on, picks } = usePath()

  return (
    <div
      className={cn(
        'pointer-events-auto w-64 rounded-lg transition-opacity',
        on.has(id) && 'ring-accent-9 ring-2',
        off.has(id) && 'opacity-40',
      )}
    >
      <QuestHandle type="target" />

      <DataList.Root className="bg-gray-3" title={t('follow')}>
        <DataList.Link
          href={getQuestUrl(quest.guid ?? 0, quest.slug, picks)}
          icon={quest.icon}
          name={quest.name}
        />
      </DataList.Root>
    </div>
  )
}
