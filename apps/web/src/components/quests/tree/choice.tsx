import { type QuestChoice } from '@anno/db/client'
import { type Node, type NodeProps } from '@xyflow/react'
import { cn } from 'cn'
import { useTranslations } from 'next-intl'

import { getUrl } from '@/lib/url'

import { DataList } from '../../data-list'
import { QuestHandle } from './handle'
import { usePath } from './path'

export type ChoiceNode = Node<
  {
    choice: QuestChoice
  },
  'choice'
>

export function QuestChoiceNode({
  data: { choice },
  id,
}: NodeProps<ChoiceNode>) {
  const t = useTranslations('component.quests.choice')
  const { off } = usePath()

  return (
    <div
      className={cn(
        'pointer-events-auto w-64 transition-opacity',
        off.has(id) && 'opacity-40',
      )}
    >
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
          <p className="text-sm whitespace-pre-line">{choice.question}</p>
        ) : null}

        {choice.kind === 'check' &&
        !(choice.requirements.length || choice.decidedBy) ? (
          <p className="text-gray-11 text-sm">{t('earlier')}</p>
        ) : null}

        {choice.decidedBy ? (
          <>
            <DataList.Label>
              {t(choice.decidedBy.unless ? 'unless' : 'picked')}
            </DataList.Label>

            {choice.decidedBy.options.map((option) =>
              option.quest ? (
                <DataList.Link
                  description={option.quest.name}
                  href={getUrl('quest', option.quest.guid, option.quest.slug)}
                  key={`${option.quest.guid}:${option.text}`}
                  name={option.text}
                />
              ) : (
                <DataList.Item key={option.text} name={option.text} />
              ),
            )}
          </>
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
