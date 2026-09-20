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
  expect(bakery?.workforce[0]?.name).toBeTruthy()
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

test.each([
  { id: 50_972, names: ['Liberti', 'Plebeians'], tiers: [1499, 1496] },
  { id: 50_974, names: ['Waders', 'Mercators'], tiers: [1500, 1503] },
])(
  'buildings include every workforce tier for $id',
  async ({ id, tiers, names }) => {
    const building = await anno.buildings.get({ id, lang: 'en' })
    expect(building?.workforce.map((entry) => entry.guid)).toEqual([...tiers])
    expect(building?.workforce.map((entry) => entry.name)).toEqual([...names])
    expect(building?.workforce.map((entry) => entry.amount)).toEqual([6, 16])
    expect(building).not.toHaveProperty('populationLevel')
    const localized = await anno.buildings.get({ id, lang: 'de' })
    const populationTiers = await anno.populationTiers.list({ lang: 'de' })
    expect(localized?.workforce.map((entry) => entry.name)).toEqual(
      tiers.map(
        (guid) =>
          populationTiers.find((tier) => tier.guid === guid)?.name ?? null,
      ),
    )
  },
)

test.each([1499, 1496])(
  'workforce filter matches either required tier: %s',
  async (tier) => {
    const result = await anno.buildings.list({
      lang: 'en',
      perPage: 1000,
      workforce: [tier],
    })
    expect(result.rows.map((row) => row.guid)).toContain(50_972)
    expect(
      result.rows.every((row) =>
        row.workforce.some((entry) => entry.guid === tier),
      ),
    ).toBe(true)
    expect(result.total).toBe(result.rows.length)
  },
)

test('workforce filters avoid duplicate buildings and ignore empty filters', async () => {
  const result = await anno.buildings.list({
    lang: 'en',
    perPage: 1000,
    workforce: [1499, 1496],
  })
  expect(result.rows.filter((row) => row.guid === 50_972)).toHaveLength(1)
  expect(result.total).toBe(result.rows.length)
  const empty = await anno.buildings.list({
    lang: 'en',
    perPage: 1,
    workforce: [],
  })
  const unfiltered = await anno.buildings.list({ lang: 'en', perPage: 1 })
  expect(empty).toEqual(unfiltered)
  const residence = await anno.buildings.get({ id: 3087, lang: 'en' })
  expect(residence).not.toBeNull()
  expect(residence?.workforce).toEqual([])
})

test.each([
  { kindName: 'Production', lang: 'en', typeName: 'Factory' },
  { kindName: 'Produktion', lang: 'de', typeName: 'Fabrik' },
] as const)(
  'building kind and type have localized names in $lang',
  async ({ lang, kindName, typeName }) => {
    const building = await anno.buildings.get({ id: 145_229, lang })
    expect(building?.kind).toEqual({ id: 'Production', name: kindName })
    expect(building?.type).toEqual({ id: 'Factory', name: typeName })
    const listed = await anno.buildings.list({
      dlc: [67_902],
      kind: ['Production'],
      lang,
      perPage: 1000,
      type: ['Factory'],
    })
    expect(listed.rows.find((row) => row.guid === 145_229)?.kind).toEqual(
      building?.kind ?? null,
    )
    expect(
      listed.rows.every(
        (row) => row.kind?.id === 'Production' && row.type?.id === 'Factory',
      ),
    ).toBe(true)
  },
)

test('buildings filter by DLC and ignore an empty DLC filter', async () => {
  const hippodrome = await anno.buildings.list({
    dlc: [67_903],
    lang: 'en',
  })
  expect(hippodrome.rows.map((row) => row.guid)).toContain(152_714)
  expect(hippodrome.rows.every((row) => row.dlc?.guid === 67_903)).toBe(true)
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

test.each(['en', 'de'] as const)(
  'buildings include localized DLC details in %s',
  async (lang) => {
    const dlcs = await anno.dlc.list({ lang })
    const building = await anno.buildings.get({ id: 152_714, lang })
    expect(building?.dlc).toEqual(
      dlcs.find((dlc) => dlc.guid === 67_903) ?? null,
    )
    expect(building?.dlc?.name).toBeTruthy()
    const baseGameBuilding = await anno.buildings.get({ id: 3615, lang })
    expect(baseGameBuilding).not.toBeNull()
    expect(baseGameBuilding?.dlc).toBeNull()
  },
)

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
  expect(market?.effects).toEqual([])
  expect(market?.buffs).toEqual([
    {
      attribute: 'Population',
      buildingGuid: 3527,
      name: 'Population',
      value: 1,
    },
    {
      attribute: 'Money',
      buildingGuid: 3527,
      name: 'Income',
      value: 1,
    },
  ])
  const kind: 'Production' | undefined =
    rows[0]?.kind?.id === 'Production' ? rows[0].kind.id : undefined
  expect(kind).toBe('Production')
})

test('production buffs include output need fulfillment without duplicate needs', async () => {
  const caelator = await anno.buildings.get({ id: 145_229, lang: 'en' })
  expect(
    caelator?.effects.map(({ attribute, value }) => ({ attribute, value })),
  ).toEqual(
    expect.arrayContaining([
      { attribute: 'Prestige', value: 2 },
      { attribute: 'Health', value: -1 },
    ]),
  )
  expect(caelator?.buffs).toHaveLength(3)
  expect(caelator?.buffs).toEqual(
    expect.arrayContaining([
      {
        attribute: 'Population',
        buildingGuid: 145_229,
        name: 'Population',
        value: 1,
      },
      { attribute: 'Money', buildingGuid: 145_229, name: 'Income', value: 3 },
      { attribute: 'Belief', buildingGuid: 145_229, name: 'Belief', value: 2 },
    ]),
  )
  const listed = await anno.buildings.list({ lang: 'en', search: 'Caelator' })
  expect(listed.rows.find((row) => row.guid === 145_229)?.buffs).toEqual(
    caelator?.buffs ?? [],
  )
})

test.each([
  { health: 'Health', income: 'Income', lang: 'en' },
  { health: 'Gesundheit', income: 'Einkommen', lang: 'de' },
] as const)(
  'building buffs and effects have localized names in $lang',
  async ({ lang, income, health }) => {
    const building = await anno.buildings.get({ id: 145_229, lang })
    expect(
      building?.buffs.find((bonus) => bonus.attribute === 'Money')?.name,
    ).toBe(income)
    expect(
      building?.effects.find((effect) => effect.attribute === 'Health')?.name,
    ).toBe(health)
    const listed = await anno.buildings.list({
      dlc: [67_902],
      lang,
      perPage: 1000,
    })
    expect(listed.rows.find((row) => row.guid === 145_229)?.buffs).toEqual(
      building?.buffs ?? [],
    )
  },
)

test('modifier percentage flags are booleans', async () => {
  const buildings = await anno.buildings.list({
    lang: 'en',
    search: 'Lavender',
  })
  const effects = buildings.rows.flatMap((building) => building.effects)
  expect(effects.length).toBeGreaterThan(0)
  expect(effects.every((effect) => effect.isPercent === false)).toBe(true)
  const item = await anno.items.get({ id: 41_350, lang: 'en' })
  expect(item?.modifiers.some((modifier) => modifier.isPercent === true)).toBe(
    true,
  )
  expect(
    item?.modifiers.every(
      (modifier) => typeof modifier.isPercent === 'boolean',
    ),
  ).toBe(true)
})

test('Amphitheatre phases expose construction inputs, time, workforce and unlocks', async () => {
  const building = await anno.buildings.get({ id: 3621, lang: 'en' })
  expect(building?.phases.map((phase) => phase.name)).toEqual([
    'Amphitheatre: Foundation',
    'Amphitheatre: Base Structure',
    'Amphitheatre: Outer Walls',
    'Amphitheatre: Arena',
  ])
  expect(building?.phases.map((phase) => phase.durationSeconds)).toEqual([
    0, 1800, 1800, 1800,
  ])
  expect(
    building?.phases.map((phase) =>
      Object.fromEntries(phase.costs.map((cost) => [cost.guid, cost.amount])),
    ),
  ).toEqual([
    { 2174: 100, 2178: 60, 1010017: 75_000 },
    { 2171: 150, 2174: 150, 2178: 300 },
    { 2171: 150, 2176: 300, 2178: 150, 2179: 300 },
    { 2152: 300, 2176: 300, 2178: 300, 2179: 300, 31698: 60 },
  ])
  expect(
    building?.phases.map((phase) =>
      phase.maintenance.map((entry) => [entry.guid, entry.amount]),
    ),
  ).toEqual([[], [[2181, 350]], [[2184, 200]], [[2185, 150]]])
  expect(
    building?.phases.map((phase) =>
      phase.unlockRequirements.map((requirement) => [
        requirement.population?.guid,
        requirement.population?.amount,
      ]),
    ),
  ).toEqual([[[1498, 1]], [[1498, 1]], [[1498, 750]], [[1498, 2250]]])
  expect(building?.unlockRequirements[0]?.population?.amount).toBe(1)
  expect(building?.costs.find((cost) => cost.guid === 1_010_017)?.amount).toBe(
    75_000,
  )
  expect(building?.costs.find((cost) => cost.guid === 31_698)?.amount).toBe(60)
  expect(
    building?.maintenance.find((entry) => entry.guid === 1_010_017)?.amount,
  ).toBe(400)
  const german = await anno.buildings.get({ id: 3621, lang: 'de' })
  const tiers = await anno.populationTiers.list({ lang: 'de' })
  expect(german?.phases[3]?.unlockRequirements[0]?.population?.name).toBe(
    tiers.find((tier) => tier.guid === 1498)?.name ?? null,
  )
  const listed = await anno.buildings.list({
    lang: 'en',
    search: 'Amphitheatre',
  })
  expect(listed.rows.find((row) => row.guid === 3621)?.phases).toEqual(
    building?.phases ?? [],
  )
})

test('Hippodrome phase time uses each stage microphase count', async () => {
  const building = await anno.buildings.get({ id: 152_714, lang: 'en' })
  expect(building?.phases.map((phase) => phase.durationSeconds)).toEqual([
    0, 1800, 2400, 3000, 3600,
  ])
  expect(building?.phases[0]?.maintenance).toEqual([])
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
