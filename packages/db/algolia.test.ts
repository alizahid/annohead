import { expect, test } from 'bun:test'

import { records } from './algolia'

test('algolia records cover every type with unique ids and both languages', async () => {
  const rows = await records()
  expect(new Set(rows.map((r) => r.objectID)).size).toBe(rows.length)
  for (const type of [
    'building',
    'item',
    'product',
    'tech',
    'quest',
    'chain',
  ]) {
    expect(rows.some((r) => r.type === type)).toBe(true)
  }
  const bakery = rows.find((r) => r.name.en === 'Bakery')
  expect(bakery?.type).toBe('building')
  expect(bakery?.name.de).toBeTruthy()
  const buildings = rows.filter((r) => r.type === 'building')
  const spinners = buildings.filter((r) => r.name.en === 'Spinner')
  expect(spinners.map((r) => r.regions).sort()).toEqual([
    ['Albion'],
    ['Latium'],
  ])
  expect(buildings.every((r) => r.regions.length > 0)).toBe(true)
  expect(
    rows.some((r) => r.type === 'item' && r.category === 'Specialist'),
  ).toBe(true)
})
