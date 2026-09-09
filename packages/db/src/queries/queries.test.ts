import { expect, test } from 'bun:test'

import {
  getBuildings,
  getProducts,
  getQuests,
  getSpecialists,
  getStoryline,
  getStorylines,
  getTechs,
} from './index'

test('specialists paginate and join effects', async () => {
  const { rows, total } = await getSpecialists({
    lang: 'english',
    perPage: 5,
    rarity: ['Legendary'],
  })
  expect(total).toBeGreaterThan(50)
  expect(rows).toHaveLength(5)
  expect(rows[0]?.name).toBeTruthy()
  expect(rows.some((r) => r.targets.length > 0 && r.modifiers.length > 0)).toBe(
    true,
  )
})

test('specialist filter by target building and attribute', async () => {
  const [bakery] = (
    await getBuildings({ lang: 'english', perPage: 1, search: 'Bakery' })
  ).rows
  const { rows } = await getSpecialists({
    attribute: 'Health',
    lang: 'english',
    targetBuilding: bakery?.guid,
  })
  expect(rows.length).toBeGreaterThan(0)
  for (const r of rows) {
    expect(r.targets.map((t) => t.guid)).toContain(bakery?.guid)
    expect(r.modifiers.map((m) => m.attribute)).toContain('Health')
  }
})

test('buildings join costs, workforce and outputs', async () => {
  const { rows } = await getBuildings({
    kind: ['Production'],
    lang: 'german',
    perPage: 10,
  })
  const bakery = rows.find((r) => r.outputs.length > 0)
  expect(bakery?.costs.length).toBeGreaterThan(0)
  expect(bakery?.populationLevel?.name).toBeTruthy()
  expect(bakery?.cycleTime).toBeGreaterThan(0)
})

test('products and techs', async () => {
  const p = await getProducts({ lang: 'english', search: 'Bread' })
  expect(p.rows[0]?.producedBy.length).toBeGreaterThan(0)
  const t = await getTechs({ lang: 'english', search: 'Armoursmithing' })
  expect(t.rows.some((r) => r.unlocksBuildings.length > 0)).toBe(true)
})

test('storylines and quests', async () => {
  const s = await getStorylines({
    lang: 'english',
    perPage: 5,
    system: 'Quests',
  })
  expect(s.rows.some((r) => r.quests.length > 0)).toBe(true)
  const q = await getQuests({
    category: 'Campaign',
    lang: 'english',
    perPage: 3,
  })
  expect(q.rows[0]?.storyline?.guid).toBeTruthy()
  expect(q.rows.some((r) => r.steps.length > 0)).toBe(true)
  const full = await getStoryline(q.rows[0]?.storyline?.guid ?? 0, 'english')
  expect(full?.nodes.length).toBeGreaterThan(0)
  expect(full?.edges.length).toBeGreaterThan(0)
  expect(full?.nodes.some((n) => n.options.length > 0)).toBe(true)
  expect(full?.nodes.some((n) => n.rewards.length > 0)).toBe(true)
})
