import { type QuestPart } from '@anno/db/client'
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

        <div className="flex flex-col gap-1">
          <div className="text-gray-11 text-sm">
            {t('part', {
              number: index + 1,
            })}
          </div>

          <div className="font-bold text-xl leading-tight">
            {part.name ?? t('untitled')}
          </div>

          {part.requirements.length ? (
            <div className="text-sm">
              {t('requires', {
                requirements: part.requirements
                  .map((item) =>
                    item.value
                      ? `${item.name}: ${f.number(item.value)}`
                      : item.name,
                  )
                  .join(' · '),
              })}
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
