import { type QuestOption } from '@anno/db/client'
import { type Node, type NodeProps } from '@xyflow/react'
import { cn } from 'cn'
import { useTranslations } from 'next-intl'

import { DataList } from '../../data-list'
import { QuestHandle } from './handle'
import { QuestOutcomeList } from './outcome'
import { usePath } from './path'

export type OptionNode = Node<
  {
    choice: number
    option: QuestOption
  },
  'option'
>

export function QuestOptionNode({
  data: { choice, option },
  id,
}: NodeProps<OptionNode>) {
  const t = useTranslations('component.quests.choice')
  const { locked, off, on, pick } = usePath()

  const empty = !(
    option.cost ||
    option.next ||
    option.requirements.length ||
    option.outcomes.length
  )

  return (
    <div className="w-72">
      <QuestHandle type="target" />

      <button
        aria-pressed={on.has(id)}
        className={cn(
          // pickable cards are tinted; ones the game decides stay gray
          'pointer-events-auto flex w-full flex-col gap-4 rounded-lg bg-gray-3 p-4 pb-3 text-left outline-none ring-accent-8 transition focus-visible:ring-2 enabled:bg-accent-3 enabled:hover:bg-accent-4',
          on.has(id) && 'ring-2 ring-accent-9',
          off.has(id) && 'opacity-40 enabled:hover:opacity-100',
        )}
        disabled={locked.has(id)}
        onClick={() => pick(choice, option.idx ?? 0)}
        type="button"
      >
        <div className="font-bold text-sm leading-tight">
          {option.text ??
            t('option', {
              number: (option.idx ?? 0) + 1,
            })}
        </div>

        <div className="flex w-full flex-col gap-1">
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
            <div className="text-gray-11 text-sm">
              {t(option.sets.length ? 'later' : 'nothing')}
            </div>
          ) : null}
        </div>
      </button>

      <QuestHandle type="source" />
    </div>
  )
}
