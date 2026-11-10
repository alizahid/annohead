import { expect, test } from 'bun:test'

import { anno } from './client'
import { nextQuest, walkQuest } from './walk'

async function quest(id: number) {
  const found = await anno.quests.get({
    id,
    lang: 'en',
  })
  if (!found) {
    throw new Error(`Quest ${id} is missing`)
  }
  return found
}

test('a quest walk decides its own checks and leaves what earlier quests decide to pick', async () => {
  const finale = await quest(50_865)
  // nothing picked: the walk waits at the first decision
  const start = walkQuest(finale, {})
  expect(start.done).toBe(false)
  expect(start.steps.map((s) => s.choice.guid)).toEqual([50_866])
  // hand Favillus over; the favours earned in earlier parts are unknown, so the tally assumes it holds
  const walk = walkQuest(finale, {
    50866: 2,
  })
  expect(walk.done).toBe(true)
  const tally = walk.steps.find((s) => s.choice.guid === 50_883)
  expect(tally?.forced).toBe(false)
  expect(tally?.picked?.idx).toBe(0)
})

test('picks carry over to the later quests of a series', async () => {
  // side with the patricians throughout: removing Favillus in Part III leads to the "against" Parts IV and V only
  const played: Array<[number, Record<number, number>]> = [
    [
      50_806,
      {
        50807: 0,
      },
    ],
    [
      50_813,
      {
        50814: 0,
      },
    ],
    [
      50_820,
      {
        50821: 0,
      },
    ],
    [
      50_832,
      {
        50833: 0,
      },
    ],
    [
      50_847,
      {
        50848: 0,
      },
    ],
    [
      50_853,
      {
        50854: 0,
      },
    ],
  ]
  // one set of picks serves the whole series, as it travels in the URL
  const picks = Object.assign({}, ...played.map(([, pick]) => pick))
  const third = await quest(50_832)
  const turn = walkQuest(
    third,
    picks,
    (await anno.quests.carry(third, picks, 'en')).carry,
  )
  expect(nextQuest(third, turn)?.guid).toBe(50_847)
  const finale = await quest(50_865)
  // Parts IV and V on the other side were never played, but Part III ruled them out
  const { carry, played: done } = await anno.quests.carry(finale, picks, 'en')
  expect(done).toEqual(played.map(([id]) => id))
  expect(carry.unknown.size).toBe(0)
  expect(carry.state.get('Colosseum_PatricianFavor')).toBeGreaterThan(0)
  const walk = walkQuest(
    finale,
    {
      ...picks,
      50866: 2,
    },
    carry,
  )
  expect(walk.done).toBe(true)
  expect(nextQuest(finale, walk)).toBeNull()
  // the favour tally decides itself, and only the patrician reward is left
  expect(walk.steps.find((s) => s.choice.guid === 50_883)?.forced).toBe(true)
  const reward = walk.steps.find((s) => s.choice.guid === 144_501)
  expect(reward?.forced).toBe(true)
  expect(reward?.picked?.idx).toBe(0)
  // with Part III still open, what it and the parts after it write stays unknown
  const { 50833: _, ...partial } = picks
  const open = await anno.quests.carry(finale, partial, 'en')
  expect(open.carry.unknown.has('Colosseum_PatricianFavor')).toBe(true)
  // arriving without picks leaves every earlier part open
  expect((await anno.quests.carry(finale, {}, 'en')).played).toEqual([])
})
