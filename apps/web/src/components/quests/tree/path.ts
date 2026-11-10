import { type Quest } from '@anno/db/client'
import { type walkQuest } from '@anno/db/walk'
import { createContext, useContext } from 'react'

export function partId(guid: number) {
  return `part-${guid}`
}

export function choiceId(guid: number) {
  return `choice-${guid}`
}

export function optionId(guid: number, idx: number | null) {
  return `option-${guid}-${idx}`
}

/** Chart nodes as the picks so far play out: on the path, ruled out (dimmed), or not pickable (decided by the game). */
export type QuestPath = {
  locked: Set<string>
  off: Set<string>
  on: Set<string>
}

export const START = 'start'

/**
 * Options that lead to the same several choices (every way a part of the story can end, before it fans out again)
 * meet in a junction, so the chart draws options + choices lines instead of options × choices. Returns the junction
 * of an option's next choices, if they have one.
 */
export function junctionsOf(quest: NonNullable<Quest>) {
  const shared = new Map<string, number>()

  for (const option of quest.choices.flatMap((choice) => choice.options)) {
    if (option.nexts.length > 1) {
      const key = junctionId(option.nexts)

      shared.set(key, (shared.get(key) ?? 0) + 1)
    }
  }

  return (nexts: Array<number>) => {
    const key = junctionId(nexts)

    return (shared.get(key) ?? 0) > 1 ? key : null
  }
}

function junctionId(nexts: Array<number>) {
  return `junction-${nexts.toSorted((a, b) => a - b).join('-')}`
}

export function followId(guid: number | null) {
  return `follow-${guid}`
}

export function tracePath(
  quest: NonNullable<Quest>,
  walk: ReturnType<typeof walkQuest>,
): QuestPath {
  const on = new Set<string>([partId(quest.guid), START])
  const off = new Set<string>()
  const locked = new Set<string>()
  const steps = new Map(walk.steps.map((s) => [s.choice.guid, s]))
  const junction = junctionsOf(quest)

  for (const choice of quest.choices) {
    const step = steps.get(choice.guid)

    if (!step) {
      // the walk is done: whatever it did not visit is ruled out
      if (walk.done) {
        off.add(choiceId(choice.guid))

        for (const option of choice.options) {
          off.add(optionId(choice.guid, option.idx))
          locked.add(optionId(choice.guid, option.idx))
        }
      }

      continue
    }

    on.add(choiceId(choice.guid))

    for (const option of choice.options) {
      const id = optionId(choice.guid, option.idx)
      const offered = step.options.includes(option)

      if (option === step.picked) {
        on.add(id)

        const meets = junction(option.nexts)

        if (meets) {
          on.add(meets)
        }

        for (const outcome of option.outcomes) {
          if (outcome.slug) {
            on.add(followId(outcome.guid))
          }
        }
      } else if (step.picked || !offered) {
        off.add(id)
      }

      if (step.forced || !offered) {
        locked.add(id)
      }
    }
  }

  return {
    locked,
    off,
    on,
  }
}

export const PathContext = createContext<
  QuestPath & {
    pick: (choice: number, idx: number) => void
    /** the picks so far as they travel in the URL (`serializeQuestPicks`) */
    picks: string
  }
>({
  locked: new Set(),
  off: new Set(),
  on: new Set(),
  pick: () => null,
  picks: '',
})

export function usePath() {
  return useContext(PathContext)
}
