import { type QuestOption } from '@anno/db/client'
import { CheckIcon, XIcon } from '@phosphor-icons/react/dist/ssr'
import { type Node, type NodeProps } from '@xyflow/react'
import { cn } from 'cn'
import { useTranslations } from 'next-intl'

import { DataList } from '../../data-list'
import { QuestHandle } from './handle'
import { QuestOutcomeList } from './outcome'
import { usePath } from './path'

export type BranchNode = Node<
  {
    choice: number
    option: QuestOption
  },
  'branch'
>

export function QuestBranchNode({
  data: { choice, option },
  id,
}: NodeProps<BranchNode>) {
  const t = useTranslations('component.quests.choice')

  const { locked, off, pick } = usePath()

  const holds = option.idx === 0
  const label = t(holds ? 'holds' : 'fails')

  return (
    <div
      className={cn(
        'flex items-center transition-opacity',
        off.has(id) && 'opacity-40',
      )}
    >
      <QuestHandle type="target" />

      <div className="flex size-14 shrink-0 items-center justify-center">
        <button
          className={cn(
            'pointer-events-auto flex size-10 rotate-45 items-center justify-center rounded-md text-white outline-none ring-accent-8 ring-offset-2 ring-offset-gray-2 focus-visible:ring-2',
            holds ? 'bg-green-9' : 'bg-red-9',
          )}
          disabled={locked.has(id)}
          onClick={() => pick(choice, option.idx ?? 0)}
          title={label}
          type="button"
        >
          {holds ? (
            <CheckIcon className="size-5 -rotate-45" weight="bold" />
          ) : (
            <XIcon className="size-5 -rotate-45" weight="bold" />
          )}
        </button>
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
