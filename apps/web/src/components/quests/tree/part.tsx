import { type QuestPart } from '@anno/db/client'
import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react/dist/ssr'
import { type Node, type NodeProps } from '@xyflow/react'
import { useFormatter, useTranslations } from 'next-intl'

import { Icon } from '../../common/icon'
import { QuestHandle } from './handle'

export type PartNode = Node<
  {
    index: number
    part: QuestPart
  },
  'part'
>

export function QuestPartNode({ data: { index, part } }: NodeProps<PartNode>) {
  const t = useTranslations('component.quests.page')
  const f = useFormatter()

  return (
    <div className="flex h-full w-full rounded-lg bg-gray-1">
      <QuestHandle type="target" />

      <div className="flex h-fit max-w-120 items-center gap-4 p-6">
        {part.icon ? <Icon className="size-10" icon={part.icon} /> : null}

        <div className="flex flex-col gap-2">
          <div className="text-gray-11 text-sm">
            {t('part', {
              number: index + 1,
            })}
          </div>

          <div className="font-bold text-xl leading-tight">
            {part.name ?? t('untitled')}
          </div>

          {part.requirements.length ? (
            <div className="flex flex-col gap-2">
              {part.requirements.map((item) => (
                <div
                  className="flex items-center gap-2 text-sm"
                  key={item.name}
                >
                  {item.negative ? (
                    <XCircleIcon className="size-5" />
                  ) : (
                    <CheckCircleIcon className="size-5" />
                  )}

                  <span>{item.name}</span>

                  <span className="tabular-nums">
                    {item.value ? f.number(item.value) : null}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {part.choices.length ? null : (
            <div className="text-gray-11 text-sm">{t('empty')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
