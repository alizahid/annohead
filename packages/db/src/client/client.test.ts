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
    await anno.buildings.list({
      lang: 'en',
      perPage: 1,
      search: 'Bakery',
    })
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
  expect(
    (
      await anno.buildings.get({
        id: guid,
        lang: 'en',
      })
    )?.guid,
  ).toBe(guid)
  expect(
    await anno.buildings.get({
      id: 1,
      lang: 'en',
    }),
  ).toBeNull()
})

test('buildings filter by DLC and ignore an empty DLC filter', async () => {
  const hippodrome = await anno.buildings.list({
    dlc: [67_903],
    lang: 'en',
  })
  expect(hippodrome.rows.map((row) => row.guid)).toContain(152_714)
  expect(hippodrome.rows.every((row) => row.dlcGuid === 67_903)).toBe(true)
  const multiple = await anno.buildings.list({
    dlc: [67_902, 67_903],
    lang: 'en',
    perPage: 100,
  })
  expect(multiple.rows.map((row) => row.guid)).toContain(145_229)
  expect(multiple.rows.map((row) => row.guid)).toContain(152_714)
  expect(multiple.rows.map((row) => row.guid)).not.toContain(3615)
  const unfiltered = await anno.buildings.list({
    lang: 'en',
    perPage: 1,
  })
  const empty = await anno.buildings.list({
    dlc: [],
    lang: 'en',
    perPage: 1,
  })
  expect(empty.total).toBe(unfiltered.total)
  expect(empty.rows).toEqual(unfiltered.rows)
})

test('buildings carry effects and buffs', async () => {
  const { rows } = await anno.buildings.list({
    lang: 'en',
    search: 'Lavender',
  })
  const [mod] = rows.flatMap((r) => r.effects)
  const attr: 'Happiness' | undefined =
    mod?.attribute === 'Happiness' ? mod.attribute : undefined
  expect(attr).toBe('Happiness')
  const market = await anno.buildings.get({
    id: 3527,
    lang: 'en',
  })
  expect(market?.buffs).toEqual([
    {
      attribute: 'Population',
      buildingGuid: 3527,
      value: 1,
    },
    {
      attribute: 'Money',
      buildingGuid: 3527,
      value: 1,
    },
  ])
  const kind: 'Production' | undefined =
    rows[0]?.kind === 'Production' ? rows[0].kind : undefined
  expect(kind).toBe('Production')
})

test('products and techs', async () => {
  const p = await anno.products.list({
    lang: 'en',
    search: 'Bread',
  })
  expect(p.rows[0]?.producedBy.length).toBeGreaterThan(0)
  expect(
    (
      await anno.products.get({
        id: p.rows[0]?.guid ?? 0,
        lang: 'en',
      })
    )?.name,
  ).toBe(p.rows[0]?.name)
  const t = await anno.techs.list({
    lang: 'en',
    search: 'Armoursmithing',
  })
  expect(t.rows.some((r) => r.unlocksBuildings.length > 0)).toBe(true)
  expect(
    (
      await anno.techs.get({
        id: t.rows[0]?.guid ?? 0,
        lang: 'en',
      })
    )?.guid,
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
    (
      await anno.quests.get({
        id: q.rows[0]?.guid ?? 0,
        lang: 'en',
      })
    )?.guid,
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

test('chains join final building and nodes', async () => {
  const { rows } = await anno.chains.list({
    lang: 'en',
    search: 'Timber',
  })
  expect(rows.length).toBeGreaterThan(0)
  const chain = await anno.chains.get({
    id: 3222,
    lang: 'en',
  })
  expect(chain?.building?.guid).toBe(3089)
  expect(chain?.nodes.length).toBeGreaterThan(1)
  expect(chain?.nodes[0]?.parentId).toBeNull()
  expect(
    await anno.chains.get({
      id: 1,
      lang: 'en',
    }),
  ).toBeNull()
})

test('search ranks name matches, dedupes variants, filters by type and paginates', async () => {
  const bread = await anno.search({
    lang: 'en',
    query: 'bread',
  })
  expect(bread.rows[0]?.name).toBe('Bread')
  expect(bread.total).toBeGreaterThan(
    bread.rows.filter((r) => r.name === 'Bread').length,
  )
  const breadChains = bread.rows.filter(
    (r) => r.type === 'chain' && r.name === 'Bread',
  )
  expect(breadChains.map((r) => r.regions).sort()).toEqual([
    ['Celtic'],
    ['Roman'],
  ])

  const camps = await anno.search({
    lang: 'en',
    query: 'Infantry Camp',
  })
  expect(camps.rows.map((r) => [r.type, r.guid, r.regions])).toEqual([
    ['building', 32_606, ['Roman', 'Celtic', 'Egyptian']],
  ])

  const items = await anno.search({
    lang: 'en',
    perPage: 3,
    query: 'a',
    type: ['item'],
  })
  expect(items.rows).toHaveLength(3)
  expect(items.rows.every((r) => r.type === 'item' && r.category)).toBe(true)
  const next = await anno.search({
    lang: 'en',
    page: 2,
    perPage: 3,
    query: 'a',
    type: ['item'],
  })
  expect(next.total).toBe(items.total)
  expect(next.rows.map((r) => r.guid)).not.toContain(items.rows[0]?.guid)

  const german = await anno.search({
    lang: 'de',
    query: 'bäckerei',
  })
  expect(german.rows.some((r) => r.type === 'building')).toBe(true)
  expect(
    (
      await anno.search({
        lang: 'en',
        query: '100%',
      })
    ).total,
  ).toBe(0)
})

test('search tolerates typos, word order, case and diacritics', async () => {
  const first = async (query: string, lang: 'en' | 'de' = 'en') =>
    (
      await anno.search({
        lang,
        query,
      })
    ).rows[0]?.name
  expect(await first('bakry')).toBe('Bakery')
  expect(await first('infantry cmap')).toBe('Infantry Camp')
  expect(await first('camp infantry')).toBe('Infantry Camp')
  expect(await first('backerei', 'de')).toBe('Bäckerei')
  expect(await first('BÄCKEREI', 'de')).toBe('Bäckerei')
  expect(
    (
      await anno.search({
        lang: 'en',
        query: 'xyzzyq',
      })
    ).total,
  ).toBe(0)
  const all = await anno.search({
    lang: 'en',
    perPage: 5,
    query: '',
  })
  expect(all.total).toBeGreaterThan(1000)
  expect(all.rows).toHaveLength(5)
})
