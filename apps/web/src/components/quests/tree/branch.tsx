import { type QuestOption } from '@anno/db/client'
import { CheckIcon, XIcon } from '@phosphor-icons/react/dist/ssr'
import { type Node, type NodeProps } from '@xyflow/react'
import { cn } from 'cn'
import { useTranslations } from 'next-intl'

import { DataList } from '../../data-list'
import { QuestHandle } from './handle'
import { QuestOutcomeList } from './outcome'

export type BranchNode = Node<
  {
    option: QuestOption
  },
  'branch'
>

export function QuestBranchNode({ data: { option } }: NodeProps<BranchNode>) {
  const t = useTranslations('component.quests.choice')

  const holds = option.idx === 0
  const label = t(holds ? 'holds' : 'fails')

  return (
    <div className="flex items-center">
      <QuestHandle type="target" />

      <div className="flex size-14 shrink-0 items-center justify-center">
        <div
          className={cn(
            'flex size-10 rotate-45 items-center justify-center rounded-md text-white',
            holds ? 'bg-green-9' : 'bg-red-9',
          )}
          role="img"
          title={label}
        >
          {holds ? (
            <CheckIcon className="size-5 -rotate-45" weight="bold" />
          ) : (
            <XIcon className="size-5 -rotate-45" weight="bold" />
          )}
        </div>
      </div>

      {option.outcomes.length ? (
        <>
          <div className="h-0.5 w-8 bg-gray-7" />

          <DataList.Root className="w-72 bg-gray-3" title={t('outcomes')}>
            <QuestOutcomeList outcomes={option.outcomes} />
          </DataList.Root>
        </>
      ) : null}

      <QuestHandle type="source" />
    </div>
  )
}
