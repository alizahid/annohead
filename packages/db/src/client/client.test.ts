import { expect, test } from 'bun:test'

import { anno } from './index'

test('specialists paginate and join effects', async () => {
  const { rows, total } = await anno.specialists.list({
    lang: 'en',
    perPage: 5,
    rarities: ['Legendary'],
  })
  expect(total).toBeGreaterThan(50)
  expect(rows).toHaveLength(5)
  const second = await anno.specialists.list({
    lang: 'en',
    page: 2,
    perPage: 5,
    rarities: ['Legendary'],
  })
  expect(second.rows.map((r) => r.guid)).not.toContain(rows[0]?.guid)
})

test('specialist filter by target building category and attribute', async () => {
  const kitchens = (
    await anno.buildings.list({
      category: ['Kitchen'],
      lang: 'en',
      perPage: 100,
    })
  ).rows.map((b) => b.guid)
  const { rows } = await anno.specialists.list({
    attributes: ['Health'],
    categories: ['Kitchen'],
    lang: 'en',
  })
  expect(rows.length).toBeGreaterThan(0)
  for (const r of rows) {
    expect(r.targets.some((t) => kitchens.includes(t.guid))).toBe(true)
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
    expect(building?.kind).toEqual({ key: 'Production', name: kindName })
    expect(building?.type).toEqual({ key: 'Factory', name: typeName })
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
        (row) => row.kind?.key === 'Production' && row.type?.key === 'Factory',
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
    rows[0]?.kind?.key === 'Production' ? rows[0].kind.key : undefined
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
  expect(t.some((r) => r.unlocks.some((u) => u.buildingGuid))).toBe(true)
  expect(
    (
      await anno.techs.get({
        id: t[0]?.guid ?? 0,
        lang: 'en',
      })
    )?.guid,
  ).toBe(t[0]?.guid)
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

test('item rarities and niches are localized filter options', () => {
  const rarities = anno.items.rarities({ lang: 'en' })
  expect(rarities.map((r) => r.key)).toEqual([
    'Common',
    'Uncommon',
    'Rare',
    'Epic',
    'Legendary',
    'Mythic',
    'Unique',
    'Quest',
  ])
  const niches = anno.items.niches({ lang: 'de' })
  expect(niches.map((n) => n.key)).not.toContain('None')
  expect(niches.find((n) => n.key === 'Nautics')?.name).toBe('Seefahrt')
  expect(anno.items.allocations({ lang: 'en' }).map((a) => a.key)).toEqual([
    'None',
    'Ship',
    'Villa',
  ])
  expect(
    anno.items.types({ lang: 'de' }).find((t) => t.key === 'Captains')?.name,
  ).toBe('Kapitäne')
})

test('item rarity, niche and type are localized label objects', async () => {
  const dorian = await anno.items.get({ id: 41_350, lang: 'de' })
  expect(dorian?.rarity).toEqual({ key: 'Unique', name: 'Einzigartig' })
  expect(dorian?.niche?.key).toBeTruthy()
  expect(dorian?.type).toEqual({ key: 'Specialist', name: 'Spezialisten' })
})

test('items filter by DLC and carry localized DLC details', async () => {
  const { rows, total } = await anno.items.list({
    dlcs: [67_903],
    lang: 'de',
    perPage: 100,
  })
  expect(total).toBe(33)
  expect(rows.every((r) => r.dlc?.guid === 67_903)).toBe(true)
  expect(rows[0]?.dlc?.name).toBeTruthy()
  const both = await anno.items.list({
    dlcs: [67_902, 67_903],
    lang: 'en',
  })
  expect(both.total).toBe(85)
  const base = await anno.items.get({ id: 41_350, lang: 'en' })
  expect(base?.dlc).toBeNull()
})

test('items filter by target building category', async () => {
  const categories = await anno.buildings.categories({ lang: 'de' })
  expect(categories.find((c) => c.key === 'Pit')?.name).toBe('Grube')
  const { rows, total } = await anno.items.list({
    categories: ['Pit'],
    lang: 'en',
  })
  expect(total).toBeGreaterThan(0)
  const pitBuildings = await anno.buildings.list({
    category: ['Pit'],
    lang: 'en',
    perPage: 50,
  })
  expect(pitBuildings.total).toBe(5)
  expect(pitBuildings.rows.every((b) => b.category === 'Pit')).toBe(true)
  const pits = pitBuildings.rows.map((b) => b.guid)
  for (const r of rows) {
    expect(r.targets.some((t) => pits.includes(t.guid))).toBe(true)
  }
})

test('search includes item rarity and null for other entity types', async () => {
  const items = await anno.search({
    lang: 'en',
    query: 'Dorian',
    type: ['item'],
  })
  expect(items.rows.find((row) => row.guid === 41_350)?.rarity).toBe('Unique')
  const buildings = await anno.search({
    lang: 'en',
    query: 'Bakery',
    type: ['building'],
  })
  expect(buildings.rows.length).toBeGreaterThan(0)
  expect(buildings.rows.every((row) => row.rarity === null)).toBe(true)
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

test.each([
  { lang: 'en', names: ['Productivity', 'Required area', 'Workforce needed'] },
  {
    lang: 'de',
    names: ['Produktivität', 'Benötigte Fläche', 'Benötigte Arbeitskraft'],
  },
] as const)(
  'item modifiers and boosts are named in $lang',
  async ({ lang, names }) => {
    const item = await anno.items.get({ id: 160_051, lang })
    expect(item?.modifiers.map((m) => m.name)).toEqual([...names])
    expect(item?.boost?.modifiers.map((m) => m.name)).toEqual([...names])
    expect(item?.modifiers.map((m) => m.value)).toEqual([40, -25, 25])
    expect(item?.modifiers.every((m) => m.isPercent)).toBe(true)
  },
)

test.each([
  { lang: 'en', name: 'Worship Cernunnos' },
  { lang: 'de', name: 'Cernunnos verehren' },
] as const)(
  'item boost condition resolves its patron in $lang',
  async ({ lang, name }) => {
    const item = await anno.items.get({ id: 160_051, lang })
    expect(item?.boost?.hint).toBeTruthy()
    expect(item?.boost?.conditions).toEqual([
      {
        guid: 50_242,
        icon: expect.stringContaining('cernunnos'),
        kind: 'patron',
        name,
        type: 'ConditionReligion',
        value: null,
      },
    ])
    expect(item?.sources.map((s) => s.kind)).toEqual(['visitor'])
  },
)

test('a condition listing several assets yields one entry each', async () => {
  const amyntas = await anno.items.get({ id: 106_956, lang: 'en' })
  expect(
    amyntas?.boost?.conditions.map((c) => [c.type, c.kind, c.name]),
  ).toEqual([
    ['ConditionMonumentEventActive', 'event', 'The Great Naumachia is running'],
    [
      'ConditionMonumentEventActive',
      'event',
      'Grand Gladiator Games is running',
    ],
    [
      'ConditionMonumentEventActive',
      'event',
      'Local Gladiator Games is running',
    ],
  ])
  const praetor = await anno.items.get({ id: 106_716, lang: 'en' })
  expect(praetor?.boost?.conditions).toEqual([
    {
      guid: 38_995,
      icon: null,
      kind: 'pool',
      name: 'Ships in the area',
      type: 'ConditionObjectCount',
      value: 1,
    },
  ])
})

test('item sources name the participant, festival or tech they come from', async () => {
  const dorian = await anno.items.get({ id: 41_350, lang: 'en' })
  expect(dorian?.boost?.conditions).toEqual([
    {
      guid: null,
      icon: null,
      kind: null,
      name: 'Health on the island',
      type: 'ConditionNeedAttributeCounter',
      value: 1000,
    },
  ])
  expect(dorian?.sources).toEqual([
    expect.objectContaining({
      guid: 31_099,
      kind: 'defeated',
      name: 'Defeat Dorian',
    }),
  ])
  const german = await anno.items.get({ id: 41_350, lang: 'de' })
  expect(german?.sources[0]?.name).toBe('Dorian besiegen')
  const { rows } = await anno.items.list({ lang: 'en', perPage: 200 })
  const kinds = new Set(rows.flatMap((r) => r.sources.map((s) => s.kind)))
  expect(kinds).toContain('trader')
  expect(kinds).toContain('festival')
  const traded = rows.find((r) => r.sources.some((s) => s.kind === 'trader'))
  expect(traded?.sources.find((s) => s.kind === 'trader')?.name).toBeTruthy()
  const festival = rows.find((r) =>
    r.sources.some((s) => s.kind === 'festival'),
  )
  expect(
    festival?.sources.find((s) => s.kind === 'festival')?.name,
  ).toBeTruthy()
})

test.each([
  {
    id: 107_337,
    name: 'Emperor relation: Rebellion, Rebellion pending',
    type: 'ConditionEmperorRelation',
  },
  {
    id: 144_878,
    name: 'Money balance',
    type: 'ConditionPlayerCounter',
  },
  {
    id: 42_046,
    name: 'Alliance with Tarragon',
    type: 'ConditionDiplomacyState',
  },
] as const)(
  'condition name describes the checked state for $id',
  async ({ id, type, name }) => {
    const item = await anno.items.get({ id, lang: 'en' })
    expect(item?.boost?.conditions[0]?.type).toBe(type)
    expect(item?.boost?.conditions[0]?.name).toBe(name)
  },
)
