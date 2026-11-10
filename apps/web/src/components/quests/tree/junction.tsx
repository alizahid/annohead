import { type Node, type NodeProps } from '@xyflow/react'
import { cn } from 'cn'

import { QuestHandle } from './handle'
import { usePath } from './path'

export type JunctionNode = Node<Record<string, never>, 'junction'>

/** Where several options that lead to the same set of choices meet, before the story fans out again */
export function QuestJunctionNode({ id }: NodeProps<JunctionNode>) {
  const { off, on } = usePath()

  return (
    <div
      className={cn(
        'bg-gray-8 size-3 rounded-full transition-opacity',
        on.has(id) && 'bg-accent-9',
        off.has(id) && 'opacity-40',
      )}
    >
      <QuestHandle type="target" />

      <QuestHandle type="source" />
    </div>
  )
}
