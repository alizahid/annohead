'use client'

import { type Quest } from '@anno/db/client'
import { layout as dagre, Graph } from '@dagrejs/dagre'
import {
  Controls,
  type Edge,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { useEffect, useMemo, useState } from 'react'

import { type BranchNode, QuestBranchNode } from './branch'
import { type ChoiceNode, QuestChoiceNode } from './choice'
import { type OptionNode, QuestOptionNode } from './option'
import { type PartNode, QuestPartNode } from './part'

const nodeTypes = {
  branch: QuestBranchNode,
  choice: QuestChoiceNode,
  option: QuestOptionNode,
  part: QuestPartNode,
}

const PADDING = 24
const NODE_GAP = 24
const RANK_GAP = 64
const PART_GAP = 64
const ORIGIN = { x: 0, y: 0 }

type FlowNode = BranchNode | ChoiceNode | OptionNode | PartNode

type Size = { height: number; width: number }

function partId(guid: number) {
  return `part-${guid}`
}

function choiceId(guid: number) {
  return `choice-${guid}`
}

function optionId(guid: number, idx: number | null) {
  return `option-${guid}-${idx}`
}

function graph(quest: Quest) {
  const nodes: Array<FlowNode> = []
  const edges: Array<Edge> = []
  const parts = new Set(quest.parts.map((part) => part.guid))

  for (const [index, part] of quest.parts.entries()) {
    const parentId = partId(part.guid)
    const choices = new Set(part.choices.map((choice) => choice.guid))

    nodes.push({
      data: { index, part },
      id: parentId,
      position: ORIGIN,
      type: 'part',
    })

    for (const choice of part.choices) {
      const source = choiceId(choice.guid)

      nodes.push({
        data: { choice },
        id: source,
        parentId,
        position: ORIGIN,
        type: 'choice',
      })

      for (const option of choice.options) {
        const id = optionId(choice.guid, option.idx)
        const node = { data: { option }, id, parentId, position: ORIGIN }

        nodes.push(
          choice.kind === 'check'
            ? { ...node, type: 'branch' }
            : { ...node, type: 'option' },
        )

        edges.push({ id: `${source}:${id}`, source, target: id })

        if (option.next !== null && choices.has(option.next)) {
          edges.push({
            id: `${id}:${choiceId(option.next)}`,
            source: id,
            target: choiceId(option.next),
          })
        }

        for (const outcome of option.outcomes) {
          if (
            outcome.kind === 'storyline' &&
            outcome.guid !== null &&
            outcome.guid !== part.guid &&
            parts.has(outcome.guid)
          ) {
            edges.push({
              className: 'follow-up',
              id: `${id}:${partId(outcome.guid)}`,
              source: id,
              target: partId(outcome.guid),
            })
          }
        }
      }
    }
  }

  return { edges, nodes }
}

function layout(nodes: Array<FlowNode>, edges: Array<Edge>) {
  const sizeOf = (node: FlowNode): Size => ({
    height: node.measured?.height ?? 0,
    width: node.measured?.width ?? 0,
  })
  const position = new Map<string, { x: number; y: number }>()
  const frame = new Map<string, Size>()

  let left = 0

  for (const part of nodes.filter((node) => node.type === 'part')) {
    const header = sizeOf(part)
    const members = nodes.filter((node) => node.parentId === part.id)
    const ids = new Set(members.map((node) => node.id))

    const chart = new Graph()
    chart.setGraph({
      marginx: PADDING,
      marginy: PADDING,
      nodesep: NODE_GAP,
      rankdir: 'LR',
      ranksep: RANK_GAP,
    })
    chart.setDefaultEdgeLabel(() => ({}))

    for (const member of members) {
      chart.setNode(member.id, sizeOf(member))
    }

    for (const edge of edges) {
      if (ids.has(edge.source) && ids.has(edge.target)) {
        chart.setEdge(edge.source, edge.target)
      }
    }

    dagre(chart, {
      disableOptimalOrderHeuristic: true,
    })

    for (const member of members) {
      const { x, y } = chart.node(member.id)
      const { height, width } = sizeOf(member)

      position.set(member.id, {
        x: x - width / 2,
        y: header.height + y - height / 2,
      })
    }

    const bounds = chart.graph()
    const width = Math.max(header.width, bounds.width ?? 0)

    position.set(part.id, { x: left, y: 0 })
    frame.set(part.id, {
      height: header.height + (members.length ? (bounds.height ?? 0) : PADDING),
      width,
    })

    left += width + PART_GAP
  }

  return nodes.map((node) => ({
    ...node,
    ...frame.get(node.id),
    position: position.get(node.id) ?? node.position,
  }))
}

type Props = {
  quest: Quest
}

function Flow({ quest }: Props) {
  const initial = useMemo(() => graph(quest), [quest])
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const measured = useNodesInitialized()
  const { fitView } = useReactFlow()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (measured && !ready) {
      setNodes((current) => layout(current, initial.edges))
      setReady(true)
    }
  }, [measured, ready, setNodes, initial.edges])

  useEffect(() => {
    const [first] = quest.parts

    if (ready && first) {
      requestAnimationFrame(async () => {
        await fitView({
          maxZoom: 1,
          nodes: [{ id: partId(first.guid) }],
          padding: 0.05,
        })
      })
    }
  }, [ready, fitView, quest])

  return (
    <ReactFlow
      className={ready ? undefined : 'invisible'}
      edges={initial.edges}
      edgesFocusable={false}
      elementsSelectable={false}
      maxZoom={1.5}
      minZoom={0.05}
      nodes={nodes}
      nodesConnectable={false}
      nodesDraggable={false}
      nodesFocusable={false}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      proOptions={{
        hideAttribution: true,
      }}
    >
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

export function QuestFlow({ quest }: Props) {
  return (
    <div className="h-[calc(100vh-(--spacing(8)))] overflow-hidden rounded-lg bg-gray-2">
      <ReactFlowProvider>
        <Flow quest={quest} />
      </ReactFlowProvider>
    </div>
  )
}
