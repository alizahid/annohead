import { type Node } from '@xyflow/react'
import { useTranslations } from 'next-intl'

import { QuestHandle } from './handle'

export type StartNode = Node<Record<string, never>, 'start'>

/** Where the threads of a quest that run side by side set out from */
export function QuestStartNode() {
  const t = useTranslations('component.quests.choice')

  return (
    <div className="bg-gray-3 rounded-lg px-4 py-3 text-sm leading-tight font-bold">
      {t('start')}

      <QuestHandle type="source" />
    </div>
  )
}
