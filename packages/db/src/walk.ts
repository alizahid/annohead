import { type Quest } from './client'
import { type QuestTest } from './client/quests'

type Choice = NonNullable<Quest>['choices'][number]
type Part = NonNullable<Quest>['series'][number]
type Option = Choice['options'][number]
type Check = Exclude<QuestTest['own'], boolean | null>

/** quest variables as the walk has set them; unset ones read as 0 (false) like in the game */
type State = Map<string, number | string>

/** What a walk starts from: variables earlier quests of the series set, and the ones nothing here can tell */
export type QuestCarry = {
  state: State
  /** variables written by a story outside the series, or by an earlier quest not played to its end */
  unknown: Set<string>
}

/** A quest as the picks play it, for the quests after it to continue from */
export type QuestRecord = {
  done: boolean
  /** every variable change along the picked path, in order */
  sets: Array<Option['sets'][number]>
}

export type QuestRecords = Record<number, QuestRecord>

/** option index picked at each choice, by choice guid */
export type QuestPicks = Record<number, number>

export type QuestStep = {
  choice: Choice
  /** made for the player: a check earlier choices decide, or the only option they leave. Checks the quest alone cannot
   * tell (goods in storage, choices made in other quests …) are not forced and assume they hold until picked otherwise. */
  forced: boolean
  /** options earlier choices leave open */
  options: Array<Option>
  picked: Option | null
}

export function parseValue(value: string | null): number | string {
  if (value === 'true') {
    return 1
  }
  if (value === 'false' || value === null) {
    return 0
  }
  const number = Number(value)
  return Number.isNaN(number) ? value : number
}

function read(state: State, variable: string) {
  return state.get(variable) ?? 0
}

/** whether a variable comparison holds; null when it reads a variable nothing here can tell */
export function compare(
  check: Check,
  state: State,
  unknown?: Set<string>,
): boolean | null {
  if (unknown?.has(check.variable) || unknown?.has(check.other ?? '')) {
    return null
  }
  const left = read(state, check.variable)
  const right = check.other ? read(state, check.other) : parseValue(check.value)
  switch (check.comparison) {
    case 'Equals':
      return left === right
    case 'AtLeast':
      return left >= right
    case 'AtMost':
      return left <= right
    case 'LessThan':
      return left < right
    case 'MoreThan':
      return left > right
    default:
      return null
  }
}

/** three-valued: null when the quest alone cannot tell */
function all(values: Array<boolean | null>) {
  if (values.includes(false)) {
    return false
  }
  return values.includes(null) ? null : true
}

function any(values: Array<boolean | null>) {
  if (!values.length || values.includes(true)) {
    return true
  }
  return values.includes(null) ? null : false
}

/** every variable a test reads */
function variablesOf(test: QuestTest | null): Array<string> {
  if (!test) {
    return []
  }
  const own =
    test.own && typeof test.own === 'object'
      ? [test.own.variable, ...(test.own.other ? [test.own.other] : [])]
      : []
  return [...own, ...test.tests.flatMap(variablesOf)]
}

/** `ignored` variables read as holding either way */
function evaluate(
  test: QuestTest | null,
  { state, unknown }: QuestCarry,
  ignored?: Set<string>,
): boolean | null {
  if (!test) {
    return true
  }
  const { own: tested } = test
  const check = typeof tested === 'object' ? tested : null
  let own = typeof tested === 'boolean' ? tested : null
  if (check) {
    own = compare(check, state, unknown)
  }
  if (own !== null && test.negate) {
    own = !own
  }
  if (check && ignored?.has(check.variable)) {
    own = true
  }
  const subs = test.tests.map((sub) =>
    evaluate(
      sub,
      {
        state,
        unknown,
      },
      ignored,
    ),
  )
  return all([own, test.any ? any(subs) : all(subs)])
}

function write(state: State, set: Option['sets'][number]) {
  if (!set.variable) {
    return
  }
  const value = set.valueVariable
    ? read(state, set.valueVariable)
    : parseValue(set.value)
  const current = Number(read(state, set.variable))
  switch (set.operation) {
    case 'Add':
      state.set(set.variable, current + Number(value))
      break
    case 'Subtract':
      state.set(set.variable, current - Number(value))
      break
    case 'Multiply':
      state.set(set.variable, current * Number(value))
      break
    default:
      state.set(set.variable, value)
  }
}

function step(choice: Choice, picks: QuestPicks, carry: QuestCarry): QuestStep {
  if (choice.kind === 'check') {
    const holds = evaluate(choice.test, carry)
    return {
      choice,
      forced: holds !== null,
      options: choice.options,
      picked:
        choice.options[
          holds === null ? (picks[choice.guid] ?? 0) : Number(!holds)
        ] ?? null,
    }
  }
  const options = choice.options.filter(
    (option) => evaluate(option.test, carry) !== false,
  )
  if (options.length === 1) {
    return {
      choice,
      forced: true,
      options,
      picked: options[0] ?? null,
    }
  }
  return {
    choice,
    forced: false,
    options,
    picked: options.find((option) => option.idx === picks[choice.guid]) ?? null,
  }
}

/**
 * What the earlier quests of the series leave behind: a quest played to its end hands on its variable changes, one
 * its start condition rules out hands on nothing, and one still open leaves what it writes unknown.
 */
export function carryOver(
  quest: NonNullable<Quest>,
  records: QuestRecords,
): QuestCarry {
  const carry: QuestCarry = {
    state: new Map(),
    unknown: new Set(),
  }
  const index = quest.series.findIndex((part) => part.guid === quest.guid)
  for (const part of quest.series.slice(0, Math.max(index, 0))) {
    const record = records[part.guid]
    if (record?.done) {
      for (const set of record.sets) {
        write(carry.state, set)
      }
      continue
    }
    if (starts(part, carry) !== false) {
      for (const variable of part.writes) {
        carry.unknown.add(variable)
      }
    }
  }
  for (const variable of quest.external) {
    carry.unknown.add(variable)
  }
  return carry
}

/**
 * Plays a quest with the given picks: checks on variables the walk knows decide themselves, and a thread stops at its
 * first decision still to pick (`done` false).
 */
export function walkQuest(
  quest: NonNullable<Quest>,
  picks: QuestPicks,
  carried: QuestCarry = carryOver(quest, {}),
) {
  // a variable no option sets, here or earlier in the series, is the game's to set (a random roll, a counter):
  // unknown rather than 0
  const written = new Set([
    ...quest.series.flatMap((part) => part.writes),
    ...quest.choices.flatMap((choice) =>
      choice.options.flatMap((option) => option.sets.map((s) => s.variable)),
    ),
  ])
  const carry: QuestCarry = {
    state: new Map(carried.state),
    unknown: new Set([
      ...carried.unknown,
      ...quest.choices
        .flatMap((choice) => [
          choice.test,
          ...choice.options.map((option) => option.test),
        ])
        .flatMap(variablesOf)
        .filter((variable) => !written.has(variable)),
    ]),
  }
  const steps: Array<QuestStep> = []
  const seen = new Set<number>()
  // threads that start side by side play one after another; a pick fans out to every choice it leads to, depth first
  const queue = quest.choices.filter((choice) => choice.entry)
  let done = true
  for (let choice = queue.shift(); choice; choice = queue.shift()) {
    if (seen.has(choice.guid)) {
      continue
    }
    seen.add(choice.guid)
    const current = step(choice, picks, carry)
    steps.push(current)
    const { picked } = current
    // a decision still to pick holds up its own thread only
    if (!picked) {
      done = false
      continue
    }
    for (const set of picked.sets) {
      write(carry.state, set)
    }
    queue.unshift(...quest.choices.filter((c) => picked.nexts.includes(c.guid)))
  }
  return {
    /** the variables as the walk leaves them */
    carry,
    done,
    steps,
  }
}

/** Whether a quest of the series can start with the variables as they are; null when nothing here can tell */
function starts(part: Part, { state, unknown }: QuestCarry) {
  // a quest guards against replays with variables it writes itself
  return evaluate(
    part.test,
    {
      state,
      unknown: new Set([...unknown, ...part.external]),
    },
    new Set(part.writes),
  )
}

/** The quest of the series that comes next once this one is played: the first later one its picks do not rule out */
export function nextQuest(
  quest: NonNullable<Quest>,
  walk: ReturnType<typeof walkQuest>,
) {
  const index = quest.series.findIndex((part) => part.guid === quest.guid)
  return (
    quest.series
      .slice(index + 1)
      .find((part) => starts(part, walk.carry) !== false) ?? null
  )
}

/** The walk as a record for the quests after this one */
export function recordQuest(
  quest: NonNullable<Quest>,
  picks: QuestPicks,
  carried: QuestCarry,
): QuestRecord {
  const walk = walkQuest(quest, picks, carried)
  return {
    done: walk.done,
    sets: walk.steps.flatMap((current) => current.picked?.sets ?? []),
  }
}
