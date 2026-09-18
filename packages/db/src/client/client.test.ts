import { expect, test } from 'bun:test'

import { anno } from './index'

test('specialists paginate and join effects', async () => {
  const { rows, total } = await anno.specialists.list({
    lang: 'en',
    perPage: 5,
    rarity: ['Legendary'],
  })
  expect(total).toBeGreaterThan(50)
  expect(rows).toHaveLength(5)
  const second = await anno.specialists.list({
    lang: 'en',
    page: 2,
    perPage: 5,
    rarity: ['Legendary'],
  })
  expect(second.rows.map((r) => r.guid)).not.toContain(rows[0]?.guid)
})

test('specialist filter by target building and attribute', async () => {
  const [bakery] = (
    await anno.buildings.list({ lang: 'en', perPage: 1, search: 'Bakery' })
  ).rows
  const { rows } = await anno.specialists.list({
    attribute: 'Health',
    lang: 'en',
    targetBuilding: bakery?.guid,
  })
  expect(rows.length).toBeGreaterThan(0)
  for (const r of rows) {
    expect(r.targets.map((t) => t.guid)).toContain(bakery?.guid)
    expect(r.modifiers.map((m) => m.attribute)).toContain('Health')
  }
})

test('buildings join costs, workforce and outputs', async () => {
  const { rows } = await anno.buildings.list({
    kind: ['Production'],
    lang: 'de',
    perPage: 10,
  })
  const bakery = rows.find((r) => r.outputs.length > 0)
  expect(bakery?.costs.length).toBeGreaterThan(0)
  expect(bakery?.populationLevel?.name).toBeTruthy()
  expect(bakery?.cycleTime).toBeGreaterThan(0)
  const guid = bakery?.guid ?? 0
  expect((await anno.buildings.get({ id: guid, lang: 'en' }))?.guid).toBe(guid)
  expect(await anno.buildings.get({ id: 1, lang: 'en' })).toBeNull()
})

test('monuments carry construction phases, phase assets are not buildings', async () => {
  const amphitheatre = await anno.buildings.get({ id: 3621, lang: 'en' })
  expect(amphitheatre?.phases.map((p) => p.name)).toEqual([
    'Amphitheatre: Foundation',
    'Amphitheatre: Outer Walls',
    'Amphitheatre: Arena',
    'Amphitheatre',
  ])
  const mosaics = amphitheatre?.phases[3]?.costs.find(
    (c) => c.name === 'Mosaics',
  )
  expect(mosaics?.amount).toBe(300)
  expect(amphitheatre?.phases[0]?.costs.length).toBeGreaterThan(0)
  expect(amphitheatre?.phases[0]?.maintenance.length).toBe(1)
  expect(await anno.buildings.get({ id: 36_908, lang: 'en' })).toBeNull()
})

test('products and techs', async () => {
  const p = await anno.products.list({ lang: 'en', search: 'Bread' })
  expect(p.rows[0]?.producedBy.length).toBeGreaterThan(0)
  expect(
    (await anno.products.get({ id: p.rows[0]?.guid ?? 0, lang: 'en' }))?.name,
  ).toBe(p.rows[0]?.name)
  const t = await anno.techs.list({ lang: 'en', search: 'Armoursmithing' })
  expect(t.rows.some((r) => r.unlocksBuildings.length > 0)).toBe(true)
  expect(
    (await anno.techs.get({ id: t.rows[0]?.guid ?? 0, lang: 'en' }))?.guid,
  ).toBe(t.rows[0]?.guid)
})

test('storylines and quests', async () => {
  const s = await anno.storylines.list({
    lang: 'en',
    perPage: 5,
    system: 'Quests',
  })
  expect(s.rows.some((r) => r.quests.length > 0)).toBe(true)
  const q = await anno.quests.list({
    category: 'Campaign',
    lang: 'en',
    perPage: 3,
  })
  expect(q.rows[0]?.storyline?.guid).toBeTruthy()
  expect(q.rows.some((r) => r.steps.length > 0)).toBe(true)
  expect(
    (await anno.quests.get({ id: q.rows[0]?.guid ?? 0, lang: 'en' }))?.guid,
  ).toBe(q.rows[0]?.guid)
  const full = await anno.storylines.get({
    id: q.rows[0]?.storyline?.guid ?? 0,
    lang: 'en',
  })
  expect(full?.nodes.length).toBeGreaterThan(0)
  expect(full?.edges.length).toBeGreaterThan(0)
  expect(full?.nodes.some((n) => n.options.length > 0)).toBe(true)
  expect(full?.nodes.some((n) => n.rewards.length > 0)).toBe(true)
})
