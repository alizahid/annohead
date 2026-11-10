'use client'

import { type Quest } from '@anno/db/client'
import {
  nextQuest,
  type QuestCarry,
  type QuestPicks,
  walkQuest,
} from '@anno/db/walk'
import { layout as dagre, Graph } from '@dagrejs/dagre'
import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react/dist/ssr'
import {
  Controls,
  type Edge,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { cn } from 'cn'
import { useTranslations } from 'next-intl'
import { useQueryStates } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'

import { NavLink } from '@/intl/nav'
import { getQuestUrl } from '@/lib/url'
import { questPicks, serializeQuestPicks } from '@/lib/validators'

import { type BranchNode, QuestBranchNode } from './branch'
import { type ChoiceNode, QuestChoiceNode } from './choice'
import { type FollowNode, QuestFollowNode } from './follow'
import { type JunctionNode, QuestJunctionNode } from './junction'
import { type OptionNode, QuestOptionNode } from './option'
import { type PartNode, QuestPartNode } from './part'
import {
  choiceId,
  followId,
  junctionsOf,
  optionId,
  PathContext,
  partId,
  type QuestPath,
  START,
  tracePath,
} from './path'
import { QuestStartNode, type StartNode } from './start'

const nodeTypes = {
  branch: QuestBranchNode,
  choice: QuestChoiceNode,
  follow: QuestFollowNode,
  junction: QuestJunctionNode,
  option: QuestOptionNode,
  part: QuestPartNode,
  start: QuestStartNode,
}

const PADDING = 24
const NODE_GAP = 24
const RANK_GAP = 64
const ORIGIN = {
  x: 0,
  y: 0,
}
// room around the chart before panning stops, as on the tech tree
const EXTENT_PADDING = 100

type FlowNode =
  | BranchNode
  | ChoiceNode
  | FollowNode
  | JunctionNode
  | OptionNode
  | PartNode
  | StartNode

type Size = {
  height: number
  width: number
}

function graph(quest: NonNullable<Quest>) {
  const parentId = partId(quest.guid)
  const nodes: Array<FlowNode> = [
    {
      data: {
        part: quest,
      },
      id: parentId,
      position: ORIGIN,
      type: 'part',
    },
  ]
  const edges: Array<Edge> = []
  const choices = new Set(quest.choices.map((choice) => choice.guid))
  const follows = new Set<string>()
  const junction = junctionsOf(quest)

  for (const choice of quest.choices) {
    const source = choiceId(choice.guid)

    nodes.push({
      data: {
        choice,
      },
      id: source,
      parentId,
      position: ORIGIN,
      type: 'choice',
    })

    for (const option of choice.options) {
      const id = optionId(choice.guid, option.idx)
      const node = {
        data: {
          choice: choice.guid,
          option,
        },
        id,
        parentId,
        position: ORIGIN,
      }

      nodes.push(
        choice.kind === 'check'
          ? {
              ...node,
              type: 'branch',
            }
          : {
              ...node,
              type: 'option',
            },
      )

      edges.push({
        id: `${source}:${id}`,
        source,
        target: id,
      })

      // options that lead to the same several choices meet in a junction first
      const meets = junction(option.nexts)

      if (meets && !nodes.some((existing) => existing.id === meets)) {
        nodes.push({
          data: {},
          id: meets,
          parentId,
          position: ORIGIN,
          type: 'junction',
        })

        for (const next of option.nexts) {
          edges.push({
            id: `${meets}:${choiceId(next)}`,
            source: meets,
            target: choiceId(next),
          })
        }
      }

      for (const next of meets ? [] : option.nexts) {
        if (choices.has(next)) {
          edges.push({
            id: `${id}:${choiceId(next)}`,
            source: id,
            target: choiceId(next),
          })
        }
      }

      if (meets) {
        edges.push({
          id: `${id}:${meets}`,
          source: id,
          target: meets,
        })
      }

      // the quest an option starts next gets a node that links to its page
      for (const outcome of option.outcomes) {
        if (!outcome.slug || outcome.guid === quest.guid) {
          continue
        }

        const target = followId(outcome.guid)

        if (!follows.has(target)) {
          follows.add(target)

          nodes.push({
            data: {
              quest: outcome,
            },
            id: target,
            parentId,
            position: ORIGIN,
            type: 'follow',
          })
        }

        if (!edges.some((edge) => edge.id === `${id}:${target}`)) {
          edges.push({
            className: 'follow-up',
            id: `${id}:${target}`,
            source: id,
            target,
          })
        }
      }
    }
  }

  // threads that set out side by side hang from one start, so the chart is a single tree
  const roots = quest.choices.filter((choice) => choice.entry)

  if (roots.length > 1) {
    nodes.push({
      data: {},
      id: START,
      parentId,
      position: ORIGIN,
      type: 'start',
    })

    for (const root of roots) {
      edges.push({
        id: `${START}:${choiceId(root.guid)}`,
        source: START,
        target: choiceId(root.guid),
      })
    }
  }

  return {
    edges,
    nodes,
  }
}

/** Edges that lead back to an earlier screen ("Return to other questions"), found walking from where the quest starts.
 * Left to dagre, these cycles get broken at random and drag menus to the far edge of the chart. */
function loopsOf(ids: Set<string>, edges: Array<Edge>) {
  const next = new Map<string, Array<Edge>>()
  const entered = new Set<string>()

  for (const edge of edges) {
    if (ids.has(edge.source) && ids.has(edge.target)) {
      next.set(edge.source, [...(next.get(edge.source) ?? []), edge])
      entered.add(edge.target)
    }
  }

  const loops = new Set<string>()
  const open = new Set<string>()
  const done = new Set<string>()

  function visit(id: string) {
    open.add(id)

    for (const edge of next.get(id) ?? []) {
      if (open.has(edge.target)) {
        loops.add(edge.id)
      } else if (!done.has(edge.target)) {
        visit(edge.target)
      }
    }

    open.delete(id)
    done.add(id)
  }

  // starts first, then whatever only a loop leads into
  for (const id of [
    ...[...ids].filter((start) => !entered.has(start)),
    ...ids,
  ]) {
    if (!done.has(id)) {
      visit(id)
    }
  }

  return loops
}

function layout(nodes: Array<FlowNode>, edges: Array<Edge>) {
  const sizeOf = (node: FlowNode): Size => ({
    height: node.measured?.height ?? 0,
    width: node.measured?.width ?? 0,
  })
  const position = new Map<
    string,
    {
      x: number
      y: number
    }
  >()
  const frame = new Map<string, Size>()

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

    const loops = loopsOf(ids, edges)

    for (const edge of edges) {
      if (ids.has(edge.source) && ids.has(edge.target) && !loops.has(edge.id)) {
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

    position.set(part.id, ORIGIN)
    frame.set(part.id, {
      height: header.height + (members.length ? (bounds.height ?? 0) : PADDING),
      width: Math.max(header.width, bounds.width ?? 0),
    })
  }

  return nodes.map((node) => ({
    ...node,
    ...frame.get(node.id),
    position: position.get(node.id) ?? node.position,
  }))
}

/** panning stops this far past the quest's frame; members sit inside it, so it alone bounds the chart */
function extentOf(
  nodes: Array<FlowNode>,
): [[number, number], [number, number]] {
  const parts = nodes.filter((node) => !node.parentId)
  const left = Math.min(...parts.map((node) => node.position.x))
  const top = Math.min(...parts.map((node) => node.position.y))
  const right = Math.max(
    ...parts.map((node) => node.position.x + (node.width ?? 0)),
  )
  const bottom = Math.max(
    ...parts.map((node) => node.position.y + (node.height ?? 0)),
  )

  return [
    [left - EXTENT_PADDING, top - EXTENT_PADDING],
    [right + EXTENT_PADDING, bottom + EXTENT_PADDING],
  ]
}

/** Edges along the picked path stand out, edges into what it rules out fade. */
function pathEdges(edges: Array<Edge>, path: QuestPath): Array<Edge> {
  return edges.map((edge) => {
    if (path.on.has(edge.source) && path.on.has(edge.target)) {
      return {
        ...edge,
        className: 'on-path',
        zIndex: 1,
      }
    }

    if (path.off.has(edge.target) || path.off.has(edge.source)) {
      return {
        ...edge,
        className: 'off-path',
      }
    }

    return edge
  })
}

type FlowProps = {
  /** what the earlier quests of the series leave behind */
  carry: QuestCarry
  /** null starts the quest over */
  onPick: (picks: QuestPicks | null) => void
  /** of every quest of the series, as the URL has them */
  picks: QuestPicks
  quest: NonNullable<Quest>
  walk: ReturnType<typeof walkQuest>
}

function Flow({ carry, onPick, picks, quest, walk }: FlowProps) {
  const t = useTranslations('component.quests.choice')
  const initial = useMemo(() => graph(quest), [quest])
  const url = serializeQuestPicks(picks)
  const next = walk.done ? nextQuest(quest, walk) : null
  const path = useMemo(() => tracePath(quest, walk), [quest, walk])
  const edges = useMemo(
    () => pathEdges(initial.edges, path),
    [initial.edges, path],
  )
  const context = useMemo(
    () => ({
      ...path,
      pick: (choice: number, idx: number) =>
        onPick({
          ...picks,
          [choice]: idx,
        }),
      picks: url,
    }),
    [path, picks, onPick, url],
  )
  // the decision the walk waits on
  const pending = walk.done
    ? null
    : (walk.steps.find((step) => !step.picked)?.choice.guid ?? null)
  const touched = quest.choices.some((choice) => choice.guid in picks)
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const measured = useNodesInitialized()
  const { fitView, getNodes, getZoom } = useReactFlow()
  const [ready, setReady] = useState(false)
  const extent = useMemo(
    () => (ready ? extentOf(nodes) : undefined),
    [ready, nodes],
  )

  useEffect(() => {
    if (measured && !ready) {
      setNodes((current) => layout(current, initial.edges))
      setReady(true)
    }
  }, [measured, ready, setNodes, initial.edges])

  useEffect(() => {
    if (ready) {
      requestAnimationFrame(async () => {
        await fitView({
          maxZoom: 1,
          padding: 0.05,
        })
      })
    }
  }, [ready, fitView])

  // after a pick, follow the path to the decision it leads to, keeping the zoom
  useEffect(() => {
    if (pending === null || !touched) {
      return
    }

    const zoom = getZoom()
    const focus = getNodes().filter(
      (node) =>
        node.id === choiceId(pending) ||
        node.id.startsWith(`option-${pending}-`),
    )

    requestAnimationFrame(async () => {
      await fitView({
        duration: 400,
        maxZoom: zoom,
        minZoom: zoom,
        nodes: focus,
      })
    })
  }, [pending, touched, fitView, getNodes, getZoom])

  return (
    <PathContext value={context}>
      <ReactFlow
        className={ready ? undefined : 'invisible'}
        edges={edges}
        edgesFocusable={false}
        elementsSelectable={false}
        maxZoom={2}
        minZoom={0.2}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodesFocusable={false}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        proOptions={{
          hideAttribution: true,
        }}
        translateExtent={extent}
      >
        <Controls showInteractive={false} />

        <Panel className="bg-gray-3 flex rounded-lg" position="top-left">
          <span className="mx-3 my-2 flex flex-col gap-1 text-sm leading-tight">
            {t(walk.done ? 'end' : 'pick')}

            {carry.state.size ? (
              <span className="text-gray-11">{t('carried')}</span>
            ) : null}
          </span>

          {touched ? (
            <button
              className="ring-accent-8 -ml-3 flex size-8.5 items-center justify-center rounded-lg outline-none focus-visible:ring-2"
              onClick={() => onPick(null)}
              type="button"
            >
              <ArrowsClockwiseIcon weight="bold" />
            </button>
          ) : null}
        </Panel>

        {next ? (
          <Panel position="top-right">
            <NavLink
              className="bg-accent-9 ring-accent-8 hover:bg-accent-10 pointer-events-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm leading-tight font-bold text-white outline-none focus-visible:ring-2"
              href={getQuestUrl(next.guid, next.slug, url)}
            >
              {t('next', {
                name: next.name ?? '',
              })}

              <ArrowRightIcon weight="bold" />
            </NavLink>
          </Panel>
        ) : null}
      </ReactFlow>
    </PathContext>
  )
}

type Props = {
  /** what the picks in the URL leave behind in the earlier quests of the series, worked out by the server */
  carry: QuestCarry
  /** earlier quests those picks play to the end */
  played: Array<number>
  quest: NonNullable<Quest>
}

export function QuestFlow({ carry, played, quest }: Props) {
  const t = useTranslations('component.quests.page')
  // picks live in the URL alone: every link on to another quest of the series takes them along
  const [{ picks }, setPicks] = useQueryStates(questPicks)
  const walk = useMemo(
    () => walkQuest(quest, picks, carry),
    [quest, picks, carry],
  )
  const url = serializeQuestPicks(picks)

  async function onPick(next: QuestPicks | null) {
    const own = new Set(quest.choices.map((choice) => String(choice.guid)))

    await setPicks({
      picks:
        next ??
        Object.fromEntries(
          Object.entries(picks).filter(([choice]) => !own.has(choice)),
        ),
    })
  }

  return (
    <div className="flex flex-col gap-12">
      {quest.series.length > 1 ? (
        <nav className="bg-gray-1 flex flex-col gap-4 rounded-lg p-4 pb-3 lg:max-w-120">
          <h2 className="text-sm leading-tight font-bold">{t('series')}</h2>

          <ol className="flex flex-col gap-1">
            {quest.series.map((part, index) => (
              <li key={part.guid}>
                <NavLink
                  aria-current={part.guid === quest.guid ? 'page' : undefined}
                  className={cn(
                    'ring-accent-8 hover:bg-accent-4 -mx-4 flex items-center gap-3 rounded-sm px-4 py-1 text-sm transition-colors outline-none focus-visible:ring-2',
                    part.guid === quest.guid && 'bg-accent-3 font-bold',
                  )}
                  href={getQuestUrl(part.guid, part.slug, url)}
                >
                  <span className="text-gray-11 w-5 text-right font-normal tabular-nums">
                    {index + 1}
                  </span>

                  <span className="flex-1">{part.name ?? t('untitled')}</span>

                  {played.includes(part.guid) ||
                  (part.guid === quest.guid && walk.done) ? (
                    <CheckCircleIcon
                      aria-label={t('played')}
                      className="text-green-11 size-5 shrink-0"
                      weight="fill"
                    />
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="bg-gray-1 h-[80vh] overflow-hidden rounded-lg">
        <ReactFlowProvider>
          <Flow
            carry={carry}
            onPick={onPick}
            picks={picks}
            quest={quest}
            walk={walk}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}
