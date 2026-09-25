import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  ne,
  type SQL,
  sql,
} from 'drizzle-orm'

import { db } from '../db'
import { type Lang, type StorylineSystem } from '../enums'
import {
  assetName,
  attribute,
  buff,
  buffModifier,
  building,
  condition,
  dlc,
  effect,
  effectBuff,
  effectTargetPool,
  item,
  product,
  quest,
  questChoice,
  questChoiceOutcome,
  questEdge,
  questline,
  questlineStoryline,
  questNode,
  questOption,
  questReward,
  questVariableChange,
  region,
  storyline,
  storylineCondition,
  storylineVariable,
} from '../schema'
import {
  anyOfLabel,
  racerAttributeLabel,
  variableChangeLabel,
  variableName,
} from './condition-labels'
import { assetNames, describeConditions } from './conditions'
import { modifierName } from './modifier-labels'
import { questQuestion, questText } from './quest-text'
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

// ---------------------------------------------------------------- rewards

/** Rewards for a set of quest nodes, with the rewarded asset's name resolved (product, item or building). */
function rewardRows(nodeGuids: Array<number>, lang: Lang) {
  const pName = localized('p_name')
  const iName = localized('i_name')
  const bName = localized('b_name')
  return db
    .select({
      amount: questReward.amount,
      amountVariable: questReward.amountVariable,
      assetGuid: questReward.assetGuid,
      icon: sql<
        string | null
      >`coalesce(${product.icon}, ${item.icon}, ${building.icon})`,
      kind: questReward.kind,
      name: sql<
        string | null
      >`coalesce(${pName.value}, ${iName.value}, ${bName.value})`,
      nodeGuid: questReward.nodeGuid,
    })
    .from(questReward)
    .leftJoin(product, eq(product.guid, questReward.assetGuid))
    .leftJoin(pName, on(pName, product.nameText, lang))
    .leftJoin(item, eq(item.guid, questReward.assetGuid))
    .leftJoin(iName, on(iName, item.nameText, lang))
    .leftJoin(building, eq(building.guid, questReward.assetGuid))
    .leftJoin(bName, on(bName, building.nameText, lang))
    .where(inArray(questReward.nodeGuid, nodeGuids))
}

function optionRows(decisionGuids: Array<number>, lang: Lang) {
  const oText = localized('o_text')
  return db
    .select({
      category: questOption.category,
      decisionGuid: questOption.decisionGuid,
      idx: questOption.idx,
      text: oText.value,
    })
    .from(questOption)
    .leftJoin(oText, on(oText, questOption.textText, lang))
    .where(inArray(questOption.decisionGuid, decisionGuids))
    .orderBy(asc(questOption.idx))
}

function nodeRows(where: SQL, lang: Lang) {
  const hText = localized('h_text')
  const tText = localized('t_text')
  const sText = localized('s_text')
  return db
    .select({
      guid: questNode.guid,
      headline: hText.value,
      name: questNode.name,
      questGuid: questNode.questGuid,
      step: sText.value,
      storylineGuid: questNode.storylineGuid,
      text: tText.value,
      timeLimitMs: questNode.timeLimitMs,
      type: questNode.type,
    })
    .from(questNode)
    .leftJoin(hText, on(hText, questNode.headlineText, lang))
    .leftJoin(tText, on(tText, questNode.textText, lang))
    .leftJoin(sText, on(sText, questNode.stepText, lang))
    .where(where)
}

// ---------------------------------------------------------------- storylines

export type StorylineFilter = {
  lang: Lang
  system?: StorylineSystem
}

const storylineQuestCount = db.$count(
  quest,
  eq(quest.storylineGuid, storyline.guid),
)
const storylineNodeCount = db.$count(
  questNode,
  eq(questNode.storylineGuid, storyline.guid),
)

/** Storylines (quest chains) with their journal quests. */
async function listStorylines(f: StorylineFilter & Page) {
  const qName = localized('q_name')
  const where = and(f.system ? eq(storyline.system, f.system) : undefined)
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({
        total: count(),
      })
      .from(storyline)
      .where(where),
    db
      .select({
        guid: storyline.guid,
        name: storyline.name,
        nodeCount: storylineNodeCount,
        questCount: storylineQuestCount,
        system: storyline.system,
      })
      .from(storyline)
      .where(where)
      .orderBy(asc(storyline.name), asc(storyline.guid))
      .limit(limit)
      .offset(offset),
  ])
  const quests = await db
    .select({
      category: quest.category,
      guid: quest.guid,
      icon: quest.icon,
      name: qName.value,
      storylineGuid: quest.storylineGuid,
    })
    .from(quest)
    .leftJoin(qName, on(qName, quest.nameText, f.lang))
    .where(
      inArray(
        quest.storylineGuid,
        rows.map((r) => r.guid),
      ),
    )
  const q = groupBy(quests, 'storylineGuid')
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((r) => ({
      ...r,
      quests: q(r.guid),
    })),
    total,
  }
}

/** One storyline with its full node/edge graph for the flowchart view. */
async function getStoryline({ id: guid, lang }: Get) {
  const [[head], nodes, edges, variables] = await Promise.all([
    db
      .select({
        guid: storyline.guid,
        name: storyline.name,
        system: storyline.system,
      })
      .from(storyline)
      .where(eq(storyline.guid, guid)),
    nodeRows(eq(questNode.storylineGuid, guid), lang),
    db
      .select({
        fromGuid: questEdge.fromGuid,
        idx: questEdge.idx,
        kind: questEdge.kind,
        optionIndex: questEdge.optionIndex,
        toGuid: questEdge.toGuid,
      })
      .from(questEdge)
      .innerJoin(questNode, eq(questNode.guid, questEdge.fromGuid))
      .where(eq(questNode.storylineGuid, guid)),
    db
      .select({
        name: storylineVariable.name,
        startValue: storylineVariable.startValue,
        type: storylineVariable.type,
      })
      .from(storylineVariable)
      .where(eq(storylineVariable.storylineGuid, guid)),
  ])
  if (!head) {
    return null
  }
  const nodeGuids = nodes.map((n) => n.guid)
  const [rewards, options] = await Promise.all([
    rewardRows(nodeGuids, lang),
    optionRows(
      nodes.filter((n) => n.type === 'Decision').map((n) => n.guid),
      lang,
    ),
  ])
  const r = groupBy(rewards, 'nodeGuid')
  const o = groupBy(options, 'decisionGuid')
  return {
    ...head,
    edges,
    nodes: nodes.map((n) => ({
      ...n,
      options: o(n.guid),
      rewards: r(n.guid),
    })),
    variables,
  }
}

// ---------------------------------------------------------------- questlines

export type QuestFilter = {
  lang: Lang
  regions?: Array<number>
  /** DLC guids */
  dlcs?: Array<number>
}

const PART_SUFFIX = /\s*(?:[–-]\s*)?\b(?:Part|Teil)\s+[IVXL]+\b.*$/

/** A questline is named after its first part: "The Mysterious Murmillo Part I" → "The Mysterious Murmillo" */
export function questlineName(title: string | null) {
  return title?.replace(PART_SUFFIX, '') ?? null
}

const partCount = db.$count(
  questlineStoryline,
  eq(questlineStoryline.questlineGuid, questline.guid),
)
const choiceCount = db.$count(
  questChoice,
  and(
    eq(questChoice.kind, 'decision'),
    inArray(
      questChoice.storylineGuid,
      db
        .select({
          guid: questlineStoryline.storylineGuid,
        })
        .from(questlineStoryline)
        .where(eq(questlineStoryline.questlineGuid, questline.guid)),
    ),
  ),
)

/** Questlines: narrative storylines linked by the choices they remember, longest first. */
async function queryQuestlines(f: QuestFilter & Page, id?: number) {
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
        /** decisions with several options across all parts */
        choices: choiceCount,
        dlc: {
          guid: dlc.guid,
          icon: dlc.icon,
          key: dlc.key,
          name: dlcT.value,
        },
        guid: questline.guid,
        icon: questline.icon,
        name: titleT.value,
        parts: partCount,
        region: regionColumns,
      })
      .from(questline)
      .leftJoin(titleT, on(titleT, questline.titleText, f.lang))
      .leftJoin(region, eq(region.id, questline.regionId))
      .leftJoin(dlc, eq(dlc.guid, questline.dlcGuid))
      .leftJoin(dlcT, on(dlcT, dlc.nameText, f.lang))
      .where(where)
      .orderBy(
        desc(partCount),
        desc(choiceCount),
        asc(titleT.value),
        asc(questline.guid),
      )
      .limit(limit)
      .offset(offset),
  ])
  return {
    pages: Math.ceil(total / limit),
    rows: rows.map((row) => ({
      ...row,
      dlc: row.dlc?.guid ? row.dlc : null,
      name: questlineName(row.name),
      region: row.region?.id ? row.region : null,
    })),
    total,
  }
}

// "part done" flags only sequence a questline's parts, which their order already shows
const PART_DONE = /done$/i

/** Requirements of options, branch checks and storylines, flattened per condition tree root. */
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
  const children = groupBy(rows, 'parentId')
  const orderOf = new Map(rows.map((row) => [row.id, row.subOrder]))
  type Requirement = Omit<
    ReturnType<typeof described>[number],
    'conditionId' | 'type' | 'unnamed' | 'variable'
  >
  function own(id: number): Array<Requirement> {
    return (
      described(id)
        // "part done" flags only sequence parts; conditions on assets the game never names are internal switches
        .filter(
          (row) =>
            !((row.variable && PART_DONE.test(row.variable)) || row.unnamed),
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
  // the game may check the same thing twice with different location scopes (the tagged island, then the current one),
  // which read the same here
  return (root: number) =>
    collect(root).filter(
      (requirement, index, list) =>
        list.findIndex(
          (other) =>
            other.name === requirement.name &&
            other.value === requirement.value,
        ) === index,
    )
}

function rewardValue(
  racerAttribute: string | null,
  amount: number | null,
  amountVariable: string | null,
  lang: Lang,
) {
  const levels =
    amountVariable === null
      ? `${amount !== null && amount < 0 ? '' : '+'}${amount ?? 1}`
      : `+ ${variableName(amountVariable)}`
  if (racerAttribute) {
    return `${racerAttributeLabel(racerAttribute, lang)} ${levels}`
  }
  return amountVariable ? variableName(amountVariable) : null
}

/** What quest nodes do that a player notices: rewards, buffs, reputation, unlocks, follow-up storylines, variables. */
async function outcomeRows(nodeGuids: Array<number>, lang: Lang) {
  const rName = localized('r_name')
  const [rewards, changes] = nodeGuids.length
    ? await Promise.all([
        db
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
          ),
        db
          .select()
          .from(questVariableChange)
          .where(inArray(questVariableChange.nodeGuid, nodeGuids))
          .then((rows) =>
            rows.filter((row) => !PART_DONE.test(row.variable ?? '')),
          ),
      ])
    : [[], []]
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
  const [assets, storylineNames, effects, modifiers, targets] =
    await Promise.all([
      assetNames(assetGuids, lang),
      db
        .select({
          guid: storyline.guid,
          icon: storyline.icon,
          name: sName.value,
        })
        .from(storyline)
        .leftJoin(sName, on(sName, storyline.titleText, lang))
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
        .innerJoin(buff, eq(buff.guid, effectBuff.buffGuid))
        .innerJoin(buffModifier, eq(buffModifier.buffGuid, buff.guid))
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
    ])
  const named = new Map(
    [...assets, ...storylineNames].map((a) => [a.guid, a] as const),
  )
  const duration = new Map(effects.map((e) => [e.guid, e.duration]))
  const mods = groupBy(modifiers, 'effectGuid')
  const tgts = groupBy(targets, 'effectGuid')
  const rewardsOf = groupBy(rewards, 'nodeGuid')
  const changesOf = groupBy(changes, 'nodeGuid')
  return (node: number) => [
    ...rewardsOf(node).map(
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
              name: modifierName(m.path, m.attribute, lang),
              value: m.value,
            }))
          : [],
        name: (assetGuid && named.get(assetGuid)?.name) || name,
        /** buildings a buff applies to */
        targets: assetGuid
          ? tgts(assetGuid).map(({ effectGuid, ...target }) => target)
          : [],
        /** racer upgrades: "speed +1"; amounts read from a variable set by earlier choices: that variable */
        value: rewardValue(racerAttribute, amount, amountVariable, lang),
      }),
    ),
    ...changesOf(node).map((change) => ({
      amount: null,
      duration: null,
      guid: null,
      icon: null,
      kind: 'variable',
      modifiers: [],
      name: variableName(change.variable ?? ''),
      targets: [],
      /** ready-to-render change: "+1", "= 2", "yes" */
      value: variableChangeLabel(change, lang),
    })),
  ]
}

/** Choices of storylines: each decision's options (checks: holds / fails) with cost, requirements and outcomes. */
async function choiceRows(storylineGuids: Array<number>, lang: Lang) {
  const hText = localized('h_text')
  const tText = localized('t_text')
  const oText = localized('o_text')
  const pName = localized('p_name')
  const choices = await db
    .select({
      conditionId: questNode.conditionId,
      guid: questChoice.nodeGuid,
      headline: hText.value,
      kind: questChoice.kind,
      speaker: {
        guid: assetName.guid,
        icon: assetName.icon,
        name: pName.value,
      },
      storylineGuid: questChoice.storylineGuid,
      text: tText.value,
    })
    .from(questChoice)
    .innerJoin(questNode, eq(questNode.guid, questChoice.nodeGuid))
    .leftJoin(hText, on(hText, questNode.headlineText, lang))
    .leftJoin(tText, on(tText, questNode.textText, lang))
    .leftJoin(assetName, eq(assetName.guid, questNode.speakerGuid))
    .leftJoin(pName, on(pName, assetName.nameText, lang))
    .where(inArray(questChoice.storylineGuid, storylineGuids))
    .orderBy(asc(questChoice.storylineGuid), asc(questChoice.position))
  const guids = choices.map((c) => c.guid)
  const [options, outcomes, requirements] = await Promise.all([
    db
      .select({
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
  const [costs, results] = await Promise.all([
    assetNames(
      [...new Set(options.flatMap((o) => (o.costGuid ? [o.costGuid] : [])))],
      lang,
    ),
    outcomeRows([...new Set(outcomes.map((o) => o.nodeGuid))], lang),
  ])
  const isChoice = new Set(guids)
  const reached = groupBy(
    outcomes.map((o) => ({ ...o, key: `${o.choiceGuid}:${o.idx}` })),
    'key',
  )
  function lead(choice: number, idx: number) {
    const nodes = reached(`${choice}:${idx}`).map((o) => o.nodeGuid)
    return {
      /** the choice this option leads to next, if any */
      next: nodes.find((n) => isChoice.has(n)) ?? null,
      outcomes: nodes.flatMap(results),
    }
  }
  const opts = groupBy(options, 'decisionGuid')
  const rows = choices.map(({ conditionId, speaker, text, ...choice }) => ({
    ...choice,
    headline: questText(choice.headline, lang),
    options:
      choice.kind === 'check'
        ? [0, 1].map((idx) => ({
            cost: null,
            idx,
            requirements: [] as ReturnType<typeof requirements>,
            text: null as string | null,
            ...lead(choice.guid, idx),
          }))
        : opts(choice.guid).map(
            ({
              conditionId: optionCondition,
              costAmount,
              costGuid,
              decisionGuid,
              ...option
            }) => {
              const cost = costs.find((c) => c.guid === costGuid)
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
                text: questText(option.text, lang),
                ...lead(choice.guid, option.idx ?? 0),
              }
            },
          ),
    /** what the decision screen asks, e.g. "What will you do with Favillus?" */
    question: questQuestion(text, lang),
    /** what a check tests; its options are 0 = holds, 1 = does not */
    requirements: conditionId ? requirements(conditionId) : [],
    /** who asks: an advisor, a resident, a trader */
    speaker: speaker?.guid ? speaker : null,
  }))
  // a check nothing depends on (text variants for the governor's gender …) is noise, and so is one that only leads to noise
  const kept = new Set(rows.map((row) => row.guid))
  let pruned = true
  while (pruned) {
    pruned = false
    for (const row of rows) {
      const matters = row.options.some(
        (o) => o.outcomes.length || (o.next !== null && kept.has(o.next)),
      )
      if (row.kind === 'check' && kept.has(row.guid) && !matters) {
        kept.delete(row.guid)
        pruned = true
      }
    }
  }
  return groupBy(
    rows
      .filter((row) => kept.has(row.guid))
      .map((row) => ({
        ...row,
        options: row.options.map((option) => ({
          ...option,
          next:
            option.next !== null && kept.has(option.next) ? option.next : null,
        })),
      })),
    'storylineGuid',
  )
}

/** One questline: its parts in order, each with its choices, what every option costs and requires, and what it leads to. */
async function getQuestline({ id, lang }: Get) {
  const head = (await queryQuestlines({ lang, perPage: 1 }, id)).rows[0] ?? null
  const titleT = localized('title')
  const requestT = localized('request')
  const parts = await db
    .select({
      conditionId: storylineCondition.conditionId,
      /** the governor request announcing the part */
      description: requestT.value,
      guid: storyline.guid,
      icon: storyline.icon,
      name: titleT.value,
    })
    .from(questlineStoryline)
    .innerJoin(storyline, eq(storyline.guid, questlineStoryline.storylineGuid))
    .leftJoin(
      storylineCondition,
      eq(storylineCondition.storylineGuid, storyline.guid),
    )
    .leftJoin(titleT, on(titleT, storyline.titleText, lang))
    .leftJoin(requestT, on(requestT, storyline.requestText, lang))
    .where(eq(questlineStoryline.questlineGuid, id))
    .orderBy(asc(questlineStoryline.idx))
  const guids = parts.map((part) => part.guid)
  const [choices, requirements] = await Promise.all([
    choiceRows(guids, lang),
    requirementRows(guids, lang),
  ])
  return (
    head && {
      ...head,
      parts: parts.map(({ conditionId, ...part }) => ({
        ...part,
        // the game names a part's first decision after the part
        choices: choices(part.guid).map((choice) =>
          choice.headline === questText(part.name, lang)
            ? { ...choice, headline: null }
            : choice,
        ),
        description: questText(part.description, lang),
        name: questText(part.name, lang),
        /** what earlier choices must have been for this part to start; "not yet played" guards left out */
        requirements: conditionId
          ? requirements(conditionId).filter((r) => !r.negative)
          : [],
      })),
    }
  )
}

function listQuestlines(f: QuestFilter & Page) {
  return queryQuestlines(f)
}

export const quests = {
  get: getQuestline,
  list: listQuestlines,
}
export const storylines = {
  get: getStoryline,
  list: listStorylines,
}
