import { type TechCategories, type Techs } from '@anno/db/client'

export const TILE_WIDTH = 134
export const TILE_HEIGHT = 155
export const TECH_SIZE = 88
export const GATE_SIZE = TECH_SIZE * 1.25
export const HUB_SIZE = 200
export const PADDING = HUB_SIZE / 2

export type Node = Techs[number] & {
  x: number
  y: number
}

export function position(
  gridX: number,
  gridY: number,
  hub: { x: number; y: number },
) {
  const shift = Math.abs(gridX) % 2 === 1 ? 0.5 : 0

  return {
    x: hub.x + gridX * TILE_WIDTH,
    y: hub.y + (gridY + shift) * TILE_HEIGHT,
  }
}

export function neighbors(x: number, y: number) {
  const diagonal = Math.abs(x) % 2 === 1 ? y + 1 : y - 1

  return [
    [x, y + 1],
    [x + 1, y],
    [x + 1, diagonal],
  ]
}

export function layout(categories: TechCategories, techs: Techs) {
  const hubs = new Map(
    categories.map((category) => [
      category.guid,
      {
        ...category,
        x: category.x ?? 0,
        y: category.y ?? 0,
      },
    ]),
  )

  const nodes: Array<Node> = []
  const cells = new Map<string, Node>()

  for (const tech of techs) {
    const hub = tech.categoryGuid ? hubs.get(tech.categoryGuid) : undefined

    if (!hub) {
      continue
    }

    const node = {
      ...tech,
      ...position(tech.gridX ?? 0, tech.gridY ?? 0, hub),
    }

    nodes.push(node)
    cells.set(`${hub.guid}:${tech.gridX}:${tech.gridY}`, node)
  }

  const lines: Array<[{ x: number; y: number }, { x: number; y: number }]> = []

  for (const node of nodes) {
    const hub = hubs.get(node.categoryGuid ?? 0)

    if (hub && node.showConnectionToCategory) {
      lines.push([hub, node])
    }

    for (const [x, y] of neighbors(node.gridX ?? 0, node.gridY ?? 0)) {
      const other = cells.get(`${node.categoryGuid}:${x}:${y}`)

      if (other) {
        lines.push([node, other])
      }
    }
  }

  const points = [...nodes, ...hubs.values()]
  const minX = Math.min(...points.map((point) => point.x)) - PADDING
  const minY = Math.min(...points.map((point) => point.y)) - PADDING

  // the box around the hubs, in content coordinates; the tree opens framed on this
  const hubXs = [...hubs.values()].map((hub) => hub.x)
  const hubYs = [...hubs.values()].map((hub) => hub.y)
  const hubBounds = {
    height: Math.max(...hubYs) - Math.min(...hubYs) + HUB_SIZE,
    left: Math.min(...hubXs) - HUB_SIZE / 2 - minX,
    top: Math.min(...hubYs) - HUB_SIZE / 2 - minY,
    width: Math.max(...hubXs) - Math.min(...hubXs) + HUB_SIZE,
  }

  return {
    height: Math.max(...points.map((point) => point.y)) + PADDING - minY,
    hubBounds,
    hubs: [...hubs.values()],
    lines,
    minX,
    minY,
    nodes,
    width: Math.max(...points.map((point) => point.x)) + PADDING - minX,
  }
}
