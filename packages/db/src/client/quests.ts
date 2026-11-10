import { and, asc, count, eq, inArray, ne } from 'drizzle-orm'

import { db } from '../db'
import { type Lang } from '../enums'
import {
  assetName,
  attribute,
  buffModifier,
  condition,
  conditionParam,
  dlc,
  effect,
  effectBuff,
  effectTargetPool,
  questChoice,
  questChoiceOutcome,
  questline,
  questOption,
  questReward,
  questShared,
  questVariableChange,
  region,
  storyline,
  storylineCondition,
} from '../schema'
import {
  carryOver,
  compare,
  parseValue,
  type QuestCarry,
  type QuestPicks,
  type QuestRecords,
  recordQuest,
} from '../walk'
import {
  anyOfLabel,
  variableCheckLabel,
  variableName,
} from './condition-labels'
import { assetNames, describeConditions, variableCheck } from './conditions'
import { type Labels, labels } from './labels'
import { nameModifiers } from './modifiers'
import { phrases } from './phrases'
import { questQuestion, questStory, questText } from './quest-text'
import {
  type Get,
  groupBy,
  localized,
  modifierColumns,
  on,
  type Page,
  paginate,
  regionColumns,
} from './shared'

// ---------------------------------------------------------------- quests

export type QuestFilter = {
  lang: Lang
  regions?: Array<number>
  /** DLC guids */
  dlcs?: Array<number>
}

/** Quests: narrative storylines with choices, one per storyline as the game starts them, by name. */
async function queryQuests(f: QuestFilter & Page, id?: number) {
  const titleT = localized('title')
  const dlcT = localized('dlc_name')
  const where = and(
    id === undefined ? undefined : eq(questline.guid, id),
    f.regions?.length ? inArray(questline.regionId, f.regions) : undefined,
    f.dlcs?.length ? inArray(questline.dlcGuid, f.dlcs) : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({
        total: count(),
      })
      .from(questline)
      .where(where),
    db
      .select({
        dlc: {
          guid: dlc.guid,
          icon: dlc.icon,
          key: dlc.key,
          name: dlcT.value,
        },
        guid: questline.guid,
        icon: questline.icon,
        name: titleT.value,
        region: regionColumns,
        /** quests that depend on each other share a series: the guid of its first quest */
        series: questline.series,
        slug: questline.slug,
      })
      .from(questline)
      .leftJoin(titleT, on(titleT, questline.titleText, f.lang))
      .leftJoin(region, eq(region.id, questline.regionId))
      .leftJoin(dlc, eq(dlc.guid, questline.dlcGuid))
      .leftJoin(dlcT, on(dlcT, dlc.nameText, f.lang))
      .where(where)
      .orderBy(asc(titleT.value), asc(questline.guid))
      .limit(limit)
      .offset(offset),
  ])
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((row) => ({
      ...row,
      dlc: row.dlc?.guid ? row.dlc : null,
      name: questText(row.name, f.lang),
      region: row.region?.id ? row.region : null,
    })),
    total,
  }
}

// "part done" flags only sequence a series, which its order already shows
const PART_DONE = /done$/iu

/** A condition tree a quest walk can evaluate: the node's own test, and its sub-tests (all, or any one of them). */
export type QuestTest = {
  any: boolean
  negate: boolean
  /** true / false when known ahead, a quest variable comparison, or null when the quest alone cannot tell: the running
   * game decides (storage, session …), or choices made in other quests do */
  own: boolean | ReturnType<typeof variableCheck> | null
  tests: Array<QuestTest>
}

/** Requirements of options, branch checks and storylines, flattened per condition tree root, and their `QuestTest`. */
async function requirementRows(ownerGuids: Array<number>, lang: Lang) {
  const rows = ownerGuids.length
    ? await db
        .select({
          id: condition.id,
          negate: condition.negate,
          parentId: condition.parentId,
          subOrder: condition.subOrder,
          type: condition.template,
        })
        .from(condition)
        .where(
          and(
            inArray(condition.ownerKind, [
              'quest_option',
              'quest_node',
              'storyline',
            ]),
            inArray(condition.ownerId, ownerGuids),
          ),
        )
    : []
  const described = groupBy(
    await describeConditions(
      rows
        .filter((row) => row.type !== 'ConditionAlwaysTrue')
        .map(({ parentId, subOrder, ...row }) => ({
          ...row,
          conditionId: row.id,
        })),
      lang,
    ),
    'conditionId',
  )
  const variableIds = rows
    .filter((row) => row.type === 'ConditionCompareVariable')
    .map((row) => row.id)
  const params = groupBy(
    variableIds.length
      ? await db
          .select()
          .from(conditionParam)
          .where(inArray(conditionParam.conditionId, variableIds))
      : [],
    'conditionId',
  )
  const children = groupBy(rows, 'parentId')
  const byId = new Map(rows.map((row) => [row.id, row]))
  const orderOf = new Map(rows.map((row) => [row.id, row.subOrder]))
  type Requirement = Omit<
    ReturnType<typeof described>[number],
    'conditionId' | 'type' | 'unnamed' | 'variable'
  >
  function own(id: number): Array<Requirement> {
    return (
      described(id)
        // conditions on assets the game never names are internal switches
        .filter(
          (row) =>
            !(row.unnamed || (row.variable && PART_DONE.test(row.variable))),
        )
        .map(
          ({ conditionId, type, unnamed, variable, ...requirement }) =>
            requirement,
        )
    )
  }
  /** a node's own requirement, then its sub-conditions: all of them, or one line listing the alternatives */
  function collect(id: number): Array<Requirement> {
    const subs = children(id)
      .map((child) => collect(child.id))
      .filter((list) => list.length)
    if (orderOf.get(id) === 'MutuallyExclusive' && subs.length > 1) {
      return [
        ...own(id),
        {
          guid: null,
          icon: null,
          kind: null,
          name: anyOfLabel(
            [
              ...new Set(
                subs.map((list) =>
                  list
                    .map((r) => (r.value ? `${r.name}: ${r.value}` : r.name))
                    .join(', '),
                ),
              ),
            ],
            lang,
          ),
          negative: false,
          value: null,
        },
      ]
    }
    return [...own(id), ...subs.flat()]
  }
  function test(id: number): QuestTest {
    const row = byId.get(id)
    const check =
      row?.type === 'ConditionCompareVariable'
        ? variableCheck(params(id))
        : null
    let tested: QuestTest['own'] = null
    if (row?.type === 'ConditionAlwaysTrue' || !row) {
      tested = true
    } else if (row.type === 'ConditionAlwaysFalse') {
      tested = false
    } else if (check) {
      tested = PART_DONE.test(check.variable) ? true : check
    }
    return {
      any: orderOf.get(id) === 'MutuallyExclusive',
      negate: Boolean(row?.negate),
      own: tested,
      tests: children(id).map((child) => test(child.id)),
    }
  }
  return {
    /** a root's own variable comparison and how its requirement reads */
    check: (root: number) => {
      const row = byId.get(root)
      const check =
        row?.type === 'ConditionCompareVariable'
          ? variableCheck(params(root))
          : null
      return check && !PART_DONE.test(check.variable)
        ? {
            check,
            names: own(root).map((requirement) => requirement.name),
            negate: Boolean(row?.negate),
          }
        : null
    },
    // the game may check the same thing twice with different location scopes (the tagged island, then the current one),
    // which read the same here
    requirements: (root: number) =>
      collect(root).filter(
        (requirement, index, list) =>
          list.findIndex(
            (other) =>
              other.name === requirement.name &&
              other.value === requirement.value,
          ) === index,
      ),
    test,
    /** every quest variable these conditions read */
    variables: new Set(
      variableIds.flatMap((id) => {
        const { other, variable } = variableCheck(params(id))
        return other ? [variable, other] : [variable]
      }),
    ),
  }
}

function rewardValue(
  racerAttribute: string | null,
  amount: number | null,
  amountVariable: string | null,
  l: Labels,
) {
  const levels =
    amountVariable === null
      ? `${amount !== null && amount < 0 ? '' : '+'}${amount ?? 1}`
      : `+ ${variableName(amountVariable)}`
  if (racerAttribute) {
    return `${l('racer_attribute', racerAttribute)?.name ?? racerAttribute} ${levels}`
  }
  return amountVariable ? variableName(amountVariable) : null
}

/** What quest nodes do that a player notices: rewards, buffs, reputation, unlocks, follow-up storylines. */
async function outcomeRows(nodeGuids: Array<number>, lang: Lang) {
  const rName = localized('r_name')
  const rewards = nodeGuids.length
    ? await db
        .select({
          amount: questReward.amount,
          amountVariable: questReward.amountVariable,
          assetGuid: questReward.assetGuid,
          attribute: questReward.attribute,
          icon: questReward.icon,
          kind: questReward.kind,
          name: rName.value,
          nodeGuid: questReward.nodeGuid,
        })
        .from(questReward)
        .leftJoin(rName, on(rName, questReward.nameText, lang))
        .where(
          and(
            inArray(questReward.nodeGuid, nodeGuids),
            // the in-game message repeating a reward already listed
            ne(questReward.kind, 'message_reward'),
          ),
        )
    : []
  const assetGuids = [
    ...new Set(
      rewards.flatMap((reward) => (reward.assetGuid ? [reward.assetGuid] : [])),
    ),
  ]
  const effectGuids = rewards.flatMap((reward) =>
    reward.kind === 'effect' && reward.assetGuid ? [reward.assetGuid] : [],
  )
  const tName = localized('t_name')
  const sName = localized('s_name')
  const [assets, storylineNames, effects, modifiers, targets, l] =
    await Promise.all([
      assetNames(assetGuids, lang),
      db
        .select({
          guid: storyline.guid,
          icon: storyline.icon,
          name: sName.value,
          slug: questline.slug,
        })
        .from(storyline)
        .leftJoin(sName, on(sName, storyline.titleText, lang))
        .leftJoin(questline, eq(questline.guid, storyline.guid))
        .where(inArray(storyline.guid, assetGuids)),
      db
        .select({
          duration: effect.durationMs,
          guid: effect.guid,
        })
        .from(effect)
        .where(inArray(effect.guid, effectGuids)),
      db
        .select({
          effectGuid: effectBuff.effectGuid,
          ...modifierColumns,
        })
        .from(effectBuff)
        .innerJoin(buffModifier, eq(buffModifier.buffGuid, effectBuff.buffGuid))
        .leftJoin(attribute, eq(attribute.id, buffModifier.attributeId))
        .where(inArray(effectBuff.effectGuid, effectGuids)),
      db
        .select({
          effectGuid: effectTargetPool.effectGuid,
          icon: effectTargetPool.icon,
          name: tName.value,
        })
        .from(effectTargetPool)
        .leftJoin(tName, on(tName, effectTargetPool.nameText, lang))
        .where(inArray(effectTargetPool.effectGuid, effectGuids)),
      labels(lang),
    ])
  const named = new Map(
    [...assets, ...storylineNames].map((a) => [a.guid, a] as const),
  )
  const questSlugs = new Map(storylineNames.map((s) => [s.guid, s.slug]))
  const duration = new Map(effects.map((e) => [e.guid, e.duration]))
  const mods = groupBy(await nameModifiers(modifiers, lang), 'effectGuid')
  const tgts = groupBy(targets, 'effectGuid')
  const rewardsOf = groupBy(rewards, 'nodeGuid')
  return (node: number) =>
    rewardsOf(node).map(
      ({
        assetGuid,
        attribute: racerAttribute,
        kind,
        amount,
        amountVariable,
        icon,
        name,
      }) => ({
        amount,
        /** timed effects only, in milliseconds */
        duration: (assetGuid && duration.get(assetGuid)) || null,
        guid: assetGuid,
        icon: (assetGuid && named.get(assetGuid)?.icon) || icon,
        /** effect, goods, item, reputation, unlock, lock, storyline, racer, xp, incident, power or variable */
        kind,
        /** what a buff changes, e.g. +9 Happiness */
        modifiers: assetGuid
          ? mods(assetGuid).map((m) => ({
              attribute: m.attribute,
              isPercent: m.isPercent,
              name: m.name,
              value: m.value,
            }))
          : [],
        name: (assetGuid && named.get(assetGuid)?.name) || name,
        /** follow-up storylines that are quests: the slug of that quest's page */
        slug: (assetGuid && questSlugs.get(assetGuid)) || null,
        /** buildings a buff applies to */
        targets: assetGuid
          ? tgts(assetGuid).map(({ effectGuid, ...target }) => target)
          : [],
        /** racer upgrades: "speed +1"; amounts read from a variable set by earlier choices: that variable */
        value: rewardValue(racerAttribute, amount, amountVariable, l),
      }),
    )
}

/** "Patrician Favor +1", "Killed Favillus": what an option changes that other quests check */
function changeLabel(
  change: {
    operation: string | null
    value: string | null
    variable: string
  },
  lang: Lang,
) {
  if (change.operation === 'Add' || change.operation === 'Subtract') {
    return `${variableName(change.variable)} ${change.operation === 'Add' ? '+' : '−'}${change.value ?? 1}`
  }
  return variableCheckLabel(
    {
      comparison: 'Equals',
      other: null,
      value: change.value ?? 'false',
      variable: change.variable,
    },
    lang,
  )
}

const MARKUP = /<[^>]+>/gu
const PERCENT = 100
// objective headlines the game completes at runtime: "Destroy:", "Deliver to [Island]:"
const DANGLING = /^.*:$/u
// the check an option's challenge becomes has no node in the game: its guid is made of the decision's and the option's
const CHALLENGE = 1_000_000_000
const OPTIONS = 100

/**
 * The options that decide a check on a flag: which picks, here or in the storylines this quest reads from, set the
 * variable so that the check holds ("if you picked"), or, when it holds untouched, so that it fails ("unless").
 */
async function deciders(
  storylineGuid: number,
  variables: Array<string>,
  shared: Array<typeof questShared.$inferSelect>,
  lang: Lang,
) {
  const oText = localized('o_text')
  const qName = localized('q_name')
  const rows = variables.length
    ? await db
        .select({
          kind: questChoice.kind,
          operation: questVariableChange.operation,
          quest: {
            guid: questline.guid,
            name: qName.value,
            slug: questline.slug,
          },
          storylineGuid: questChoice.storylineGuid,
          text: oText.value,
          value: questVariableChange.value,
          valueVariable: questVariableChange.valueVariable,
          variable: questVariableChange.variable,
        })
        .from(questVariableChange)
        .innerJoin(
          questChoiceOutcome,
          eq(questChoiceOutcome.nodeGuid, questVariableChange.nodeGuid),
        )
        .innerJoin(
          questChoice,
          eq(questChoice.nodeGuid, questChoiceOutcome.choiceGuid),
        )
        .leftJoin(
          questOption,
          and(
            eq(questOption.decisionGuid, questChoiceOutcome.choiceGuid),
            eq(questOption.idx, questChoiceOutcome.idx),
          ),
        )
        .leftJoin(oText, on(oText, questOption.textText, lang))
        .leftJoin(questline, eq(questline.guid, questChoice.storylineGuid))
        .leftJoin(qName, on(qName, questline.titleText, lang))
        .where(inArray(questVariableChange.variable, variables))
    : []
  // storylines name their own variables alike ("QuestDenied"): only this quest's writes and those it reads count
  const writers = groupBy(
    rows.filter(
      (row) =>
        row.storylineGuid === storylineGuid ||
        shared.some(
          (s) =>
            s.kind === 'read' &&
            s.variable === row.variable &&
            s.otherGuid === row.storylineGuid,
        ),
    ),
    'variable',
  )
  return (check: ReturnType<typeof variableCheck>, negate: boolean) => {
    const written = writers(check.variable)
    const flag = written.every(
      (row) =>
        (row.operation ?? 'Set') === 'Set' &&
        row.valueVariable === null &&
        row.value !== null,
    )
    if (check.other || !flag) {
      return null
    }
    const holds = (value: number | string | null) =>
      (compare(
        check,
        new Map(value === null ? [] : [[check.variable, value]]),
      ) ===
        true) !==
      negate
    const untouched = holds(null)
    const picks = written.filter(
      (row) =>
        row.kind === 'decision' &&
        row.text &&
        holds(parseValue(row.value)) !== untouched,
    )
    const options = [
      ...new Map(
        picks.map((row) => {
          const text = questText(row.text, lang)?.replace(MARKUP, '').trim()
          return [
            `${row.storylineGuid}:${text}`,
            {
              /** set when the option is another quest's */
              quest:
                row.storylineGuid !== storylineGuid && row.quest?.guid
                  ? row.quest
                  : null,
              text: text ?? null,
            },
          ] as const
        }),
      ).values(),
    ]
    return options.length
      ? {
          options,
          /** the check holds unless one of the options was picked */
          unless: untouched,
        }
      : null
  }
}

/** Choices of a storyline: each decision's options (checks: holds / fails) with cost, requirements and outcomes. */
async function choiceRows(
  storylineGuid: number,
  lang: Lang,
  shared: Array<typeof questShared.$inferSelect>,
) {
  const hText = localized('h_text')
  const tText = localized('t_text')
  const oText = localized('o_text')
  const pName = localized('p_name')
  const choices = await db
    .select({
      conditionId: questChoice.conditionId,
      entry: questChoice.entry,
      guid: questChoice.nodeGuid,
      headline: hText.value,
      kind: questChoice.kind,
      speaker: {
        guid: assetName.guid,
        icon: assetName.icon,
        name: pName.value,
      },
      text: tText.value,
    })
    .from(questChoice)
    .leftJoin(hText, on(hText, questChoice.headlineText, lang))
    .leftJoin(tText, on(tText, questChoice.textText, lang))
    .leftJoin(assetName, eq(assetName.guid, questChoice.speakerGuid))
    .leftJoin(pName, on(pName, assetName.nameText, lang))
    .where(eq(questChoice.storylineGuid, storylineGuid))
    .orderBy(asc(questChoice.position))
  const guids = choices.map((c) => c.guid)
  const [options, outcomes, { check, requirements, test, variables }] =
    await Promise.all([
      db
        .select({
          challenge: questOption.challenge,
          challengeValue: questOption.challengeValue,
          challengeVariable: questOption.challengeVariable,
          conditionId: questOption.conditionId,
          costAmount: questOption.costAmount,
          costGuid: questOption.costGuid,
          decisionGuid: questOption.decisionGuid,
          idx: questOption.idx,
          text: oText.value,
        })
        .from(questOption)
        .leftJoin(oText, on(oText, questOption.textText, lang))
        .where(inArray(questOption.decisionGuid, guids))
        .orderBy(asc(questOption.idx)),
      db
        .select()
        .from(questChoiceOutcome)
        .where(inArray(questChoiceOutcome.choiceGuid, guids)),
      requirementRows(guids, lang),
    ])
  const nodeGuids = [...new Set(outcomes.map((o) => o.nodeGuid))]
  // what an option changes shows when something checks it: this quest, or a storyline that reads it
  const remembered = new Set([
    ...variables,
    ...shared.filter((row) => row.kind === 'write').map((row) => row.variable),
  ])
  const [costs, results, changes, decided, l] = await Promise.all([
    assetNames(
      [...new Set(options.flatMap((o) => (o.costGuid ? [o.costGuid] : [])))],
      lang,
    ),
    outcomeRows(nodeGuids, lang),
    nodeGuids.length
      ? db
          .select({
            nodeGuid: questVariableChange.nodeGuid,
            operation: questVariableChange.operation,
            value: questVariableChange.value,
            valueVariable: questVariableChange.valueVariable,
            variable: questVariableChange.variable,
          })
          .from(questVariableChange)
          .where(inArray(questVariableChange.nodeGuid, nodeGuids))
          .then((changed) =>
            changed.filter((row) => !PART_DONE.test(row.variable ?? '')),
          )
      : [],
    deciders(storylineGuid, [...variables], shared, lang),
    labels(lang),
  ])
  const changesOf = groupBy(changes, 'nodeGuid')
  const isChoice = new Set(guids)
  const reached = groupBy(
    outcomes.map((o) => ({
      ...o,
      key: `${o.choiceGuid}:${o.idx}`,
    })),
    'key',
  )
  function lead(choice: number, idx: number) {
    const nodes = reached(`${choice}:${idx}`).map((o) => o.nodeGuid)
    const sets = nodes
      .flatMap(changesOf)
      .map(({ nodeGuid, ...change }) => change)
    return {
      /** the choices this option leads to next: several when the story fans out */
      nexts: nodes.filter((n) => n !== choice && isChoice.has(n)),
      outcomes: nodes.flatMap(results),
      /** what the option changes that a check reads, here or in a later quest, e.g. "Patrician Favor +1" */
      remembers: [
        ...new Set(
          sets.flatMap((change) =>
            change.variable && remembered.has(change.variable)
              ? [
                  changeLabel(
                    {
                      ...change,
                      variable: change.variable,
                    },
                    lang,
                  ),
                ]
              : [],
          ),
        ),
      ],
      /** quest variables the option writes, which later checks read */
      sets,
    }
  }
  const opts = groupBy(options, 'decisionGuid')
  type Requirement = ReturnType<typeof requirements>[number]
  const stated = (
    name: string,
    icon: string | null = null,
    value: number | null = null,
  ): Requirement => ({
    guid: null,
    icon,
    kind: null,
    name,
    negative: false,
    value,
  })
  /** only the running game can tell: the walk assumes it holds until picked otherwise */
  const open: QuestTest = {
    any: false,
    negate: false,
    own: null,
    tests: [],
  }
  const branches = (guid: number, holds: number, fails: number) =>
    [holds, fails].map((from, idx) => ({
      cost: null,
      idx,
      requirements: [] as Array<Requirement>,
      test: null as QuestTest | null,
      text: null as string | null,
      ...lead(guid, from),
    }))
  const rows = choices.flatMap(({ conditionId, speaker, text, ...choice }) => {
    const own = conditionId ? check(conditionId) : null
    const decidedBy = own ? decided(own.check, own.negate) : null
    const objective = choice.kind === 'objective'
    // an option that can fail leads to a check of its own: what decides it, then what success and failure bring
    const challenges = opts(choice.guid).flatMap((option) => {
      if (!option.challenge) {
        return []
      }
      const idx = option.idx ?? 0
      const variable =
        option.challenge === 'variable' && option.challengeVariable
          ? {
              comparison: 'AtLeast',
              other: null,
              value: String(option.challengeValue ?? 0),
              variable: option.challengeVariable,
            }
          : null
      const label = l(
        'attribute',
        option.challenge === 'prestige' ? 'Prestige' : 'Knowledge',
      )
      let requirement = stated(
        option.challengeValue === null
          ? phrases[lang].words.chance
          : `${phrases[lang].words.chance}: ${Math.round(option.challengeValue * PERCENT)}%`,
      )
      if (variable) {
        requirement = stated(variableCheckLabel(variable, lang))
      } else if (option.challenge !== 'chance') {
        requirement = stated(
          label?.name ?? option.challenge,
          label?.icon,
          option.challengeValue,
        )
      }
      return [
        {
          decidedBy: null,
          entry: false,
          guid: CHALLENGE + choice.guid * OPTIONS + idx,
          headline: null,
          kind: 'check' as const,
          options: branches(choice.guid, idx, -(idx + 1)),
          question: null,
          requirements: [requirement],
          speaker: null,
          story: null,
          test: {
            ...open,
            own: variable,
          } as QuestTest,
        },
      ]
    })
    return [
      {
        ...choice,
        /** checks on a flag: the picks that decide it, which then stand in for the flag's name */
        decidedBy,
        /** where the story sets out: the quest's start reaches this choice before any other */
        entry: Boolean(choice.entry),
        headline: objective ? null : questText(choice.headline, lang),
        /** checks and objectives read as "the game checks": options are 0 = holds, 1 = does not */
        kind:
          choice.kind === 'decision'
            ? ('decision' as const)
            : ('check' as const),
        options:
          choice.kind === 'decision'
            ? opts(choice.guid).map(
                ({
                  challenge,
                  challengeValue,
                  challengeVariable,
                  conditionId: optionCondition,
                  costAmount,
                  costGuid,
                  decisionGuid,
                  ...option
                }) => {
                  const cost = costs.find((c) => c.guid === costGuid)
                  const idx = option.idx ?? 0
                  return {
                    ...option,
                    /** coins or goods paid to pick the option */
                    cost: cost
                      ? {
                          amount: costAmount,
                          guid: cost.guid,
                          icon: cost.icon,
                          name: cost.name,
                        }
                      : null,
                    requirements: optionCondition
                      ? requirements(optionCondition)
                      : [],
                    /** whether earlier choices offer the option at all */
                    test: optionCondition ? test(optionCondition) : null,
                    text: questText(option.text, lang),
                    ...(challenge
                      ? {
                          nexts: [CHALLENGE + choice.guid * OPTIONS + idx],
                          outcomes: [],
                          remembers: [],
                          sets: [],
                        }
                      : lead(choice.guid, idx)),
                  }
                },
              )
            : branches(choice.guid, 0, 1),
        /** what the decision screen asks, e.g. "What will you do with Favillus?" */
        question: questQuestion(text, lang),
        /** what a check tests */
        requirements: [
          ...(objective
            ? [
                stated(
                  [
                    phrases[lang].conditions[
                      'ConditionPlayerCounter:QuestObjectiveComponentSolved'
                    ],
                    questText(choice.headline, lang)
                      ?.replace(MARKUP, '')
                      .trim()
                      .replace(DANGLING, ''),
                  ]
                    .filter(Boolean)
                    .join(': '),
                ),
              ]
            : []),
          ...(conditionId
            ? requirements(conditionId).filter(
                (requirement) =>
                  !(decidedBy && own?.names.includes(requirement.name)),
              )
            : []),
        ],
        /** who asks: an advisor, a resident, a trader */
        speaker: speaker?.guid ? speaker : null,
        /** the rest of the screen's text: the story leading up to the question, with the game's <i> / <b> markup */
        story: questStory(text, lang),
        /** checks: what holds / fails branches on */
        test: conditionId ? test(conditionId) : objective ? open : null,
      },
      ...challenges,
    ]
  })
  // a check nothing depends on (text variants for the governor's gender …) is noise, and so is one that only leads to noise
  const kept = new Set(rows.map((row) => row.guid))
  let pruned = true
  while (pruned) {
    pruned = false
    for (const row of rows) {
      const matters = row.options.some(
        (o) =>
          o.outcomes.length ||
          o.sets.length ||
          o.nexts.some((next) => kept.has(next)),
      )
      if (row.kind === 'check' && kept.has(row.guid) && !matters) {
        kept.delete(row.guid)
        pruned = true
      }
    }
  }
  const shown = rows
    .filter((row) => kept.has(row.guid))
    .map((row) => ({
      ...row,
      options: row.options.map((option) => ({
        ...option,
        nexts: option.nexts.filter((next) => kept.has(next)),
      })),
    }))
  // nothing may be out of reach: a choice no entry leads to (its way in was noise, or one the walk misses) is an entry
  const inReach = new Set<number>()
  const visit = (guid: number) => {
    const row = inReach.has(guid) ? null : shown.find((c) => c.guid === guid)
    if (row) {
      inReach.add(guid)
      for (const next of row.options.flatMap((option) => option.nexts)) {
        visit(next)
      }
    }
  }
  for (const row of shown) {
    if (row.entry) {
      visit(row.guid)
    }
  }
  for (const row of shown) {
    if (!inReach.has(row.guid)) {
      row.entry = true
      visit(row.guid)
    }
  }
  return shown
}

/** One quest: its choices, what every option costs and requires and what it leads to, and the series it belongs to. */
async function getQuest({ id, lang }: Get) {
  const head =
    (
      await queryQuests(
        {
          lang,
          perPage: 1,
        },
        id,
      )
    ).rows[0] ?? null
  if (!head) {
    return null
  }
  const titleT = localized('title')
  const series = await db
    .select({
      conditionId: storylineCondition.conditionId,
      guid: questline.guid,
      icon: questline.icon,
      name: titleT.value,
      slug: questline.slug,
    })
    .from(questline)
    .leftJoin(
      storylineCondition,
      eq(storylineCondition.storylineGuid, questline.guid),
    )
    .leftJoin(titleT, on(titleT, questline.titleText, lang))
    .where(eq(questline.series, head.series ?? id))
    .orderBy(asc(questline.idx))
  const guids = series.map((quest) => quest.guid)
  const [shared, written, { requirements, test }] = await Promise.all([
    db
      .select()
      .from(questShared)
      .where(inArray(questShared.storylineGuid, guids)),
    db
      .selectDistinct({
        guid: questChoice.storylineGuid,
        variable: questVariableChange.variable,
      })
      .from(questVariableChange)
      .innerJoin(
        questChoiceOutcome,
        eq(questChoiceOutcome.nodeGuid, questVariableChange.nodeGuid),
      )
      .innerJoin(
        questChoice,
        eq(questChoice.nodeGuid, questChoiceOutcome.choiceGuid),
      )
      .where(inArray(questChoice.storylineGuid, guids)),
    requirementRows(guids, lang),
  ])
  const choices = await choiceRows(
    id,
    lang,
    shared.filter((row) => row.storylineGuid === id),
  )
  const writes = groupBy(written, 'guid')
  // what a walk needs of each quest in the series to carry picks from one to the next (`carryOver`)
  const parts = series.map(({ conditionId, ...quest }) => ({
    ...quest,
    /** variables it reads that a story outside the series writes: no walk can tell them */
    external: [
      ...new Set(
        shared
          .filter(
            (row) =>
              row.storylineGuid === quest.guid &&
              row.kind === 'read' &&
              !guids.includes(row.otherGuid),
          )
          .map((row) => row.variable),
      ),
    ],
    name: questText(quest.name, lang),
    /** whether earlier choices let the quest start at all */
    test: conditionId ? test(conditionId) : null,
    /** variables its options write */
    writes: writes(quest.guid).flatMap((row) =>
      row.variable && !PART_DONE.test(row.variable) ? [row.variable] : [],
    ),
  }))
  const start = series.find((quest) => quest.guid === id)?.conditionId
  return {
    ...head,
    // the game names a quest's first decision after the quest
    choices: choices.map((choice) =>
      choice.headline === head.name
        ? {
            ...choice,
            headline: null,
          }
        : choice,
    ),
    external: parts.find((quest) => quest.guid === id)?.external ?? [],
    /** what the game must have for the quest to start; "not yet played" guards left out */
    requirements: start ? requirements(start).filter((r) => !r.negative) : [],
    /** the quests this one depends on or leads to, itself included, in order; just itself for a one-off */
    series: parts,
    /** the story the quest opens with: the text of the decision it is named after */
    story:
      choices.find((choice) => choice.headline === head.name)?.story ?? null,
  }
}

/**
 * What the earlier quests of the quest's series leave behind when played with `picks` (walk.ts `carryOver`), and
 * which of them the picks play to the end. Picks name choices of any quest, so one set serves the whole series.
 */
async function carryQuest(
  quest: NonNullable<Awaited<ReturnType<typeof getQuest>>>,
  picks: QuestPicks,
  lang: Lang,
): Promise<{
  carry: QuestCarry
  played: Array<number>
}> {
  const index = quest.series.findIndex((part) => part.guid === quest.guid)
  const earlier = Object.keys(picks).length
    ? await Promise.all(
        quest.series.slice(0, Math.max(index, 0)).map((part) =>
          getQuest({
            id: part.guid,
            lang,
          }),
        ),
      )
    : []
  const records: QuestRecords = {}
  for (const part of earlier) {
    if (part) {
      records[part.guid] = recordQuest(part, picks, carryOver(part, records))
    }
  }
  return {
    carry: carryOver(quest, records),
    played: earlier.flatMap((part) =>
      part && records[part.guid]?.done ? [part.guid] : [],
    ),
  }
}

function listQuests(f: QuestFilter & Page) {
  return queryQuests(f)
}

export const quests = {
  carry: carryQuest,
  get: getQuest,
  list: listQuests,
}
