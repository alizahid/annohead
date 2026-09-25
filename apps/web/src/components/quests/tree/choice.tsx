import { type QuestChoice } from '@anno/db/client'
import { type Node, type NodeProps } from '@xyflow/react'
import { useTranslations } from 'next-intl'

import { DataList } from '../../data-list'
import { QuestHandle } from './handle'

export type ChoiceNode = Node<{ choice: QuestChoice }, 'choice'>

export function QuestChoiceNode({ data: { choice } }: NodeProps<ChoiceNode>) {
  const t = useTranslations('component.quests.choice')

  return (
    <div className="w-64">
      <QuestHandle type="target" />

      <DataList.Root
        className="bg-gray-3"
        title={
          choice.kind === 'check'
            ? t('check')
            : (choice.headline ?? t('decision'))
        }
      >
        {choice.speaker ? (
          <DataList.Item
            icon={choice.speaker.icon}
            name={choice.speaker.name}
          />
        ) : null}

        {choice.question ? (
          <p className="whitespace-pre-line text-sm">{choice.question}</p>
        ) : null}

        {choice.requirements.map((requirement) => (
          <DataList.Item
            icon={requirement.icon}
            key={`${requirement.name}:${requirement.guid}`}
            name={requirement.name}
            value={requirement.value ?? undefined}
          />
        ))}
      </DataList.Root>

      <QuestHandle type="source" />
    </div>
  )
}
