import { type QuestOption } from '@anno/db/client'
import { type Node, type NodeProps } from '@xyflow/react'
import { useTranslations } from 'next-intl'

import { DataList } from '../../data-list'
import { QuestHandle } from './handle'
import { QuestOutcomeList } from './outcome'

export type OptionNode = Node<
  {
    option: QuestOption
  },
  'option'
>

export function QuestOptionNode({ data: { option } }: NodeProps<OptionNode>) {
  const t = useTranslations('component.quests.choice')

  const empty = !(
    option.cost ||
    option.next ||
    option.requirements.length ||
    option.outcomes.length
  )

  return (
    <div className="w-72">
      <QuestHandle type="target" />

      <DataList.Root
        className="bg-gray-3"
        title={
          option.text ??
          t('option', {
            number: (option.idx ?? 0) + 1,
          })
        }
      >
        {option.cost ? (
          <>
            <DataList.Label>{t('cost')}</DataList.Label>

            <DataList.Item
              icon={option.cost.icon}
              name={option.cost.name}
              value={option.cost.amount}
            />
          </>
        ) : null}

        {option.requirements.length ? (
          <>
            <DataList.Label>{t('requires')}</DataList.Label>

            {option.requirements.map((requirement) => (
              <DataList.Item
                icon={requirement.icon}
                key={`${requirement.name}:${requirement.guid}`}
                name={requirement.name}
                value={requirement.value ?? undefined}
              />
            ))}
          </>
        ) : null}

        {option.outcomes.length ? (
          <>
            <DataList.Label>{t('outcomes')}</DataList.Label>

            <QuestOutcomeList outcomes={option.outcomes} />
          </>
        ) : null}

        {empty ? (
          <div className="text-gray-11 text-sm">{t('nothing')}</div>
        ) : null}
      </DataList.Root>

      <QuestHandle type="source" />
    </div>
  )
}
