import { and, asc, count, eq, inArray, like, type SQL, sql } from 'drizzle-orm'

import { db } from '../db'
import {
  building,
  item,
  product,
  quest,
  questEdge,
  questNode,
  questOption,
  questReward,
  storyline,
  storylineVariable,
} from '../schema'
import {
  groupBy,
  type Lang,
  localized,
  on,
  type Page,
  paginate,
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
  search?: string
  system?: string
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
export async function getStorylines(f: StorylineFilter & Page) {
  const qName = localized('q_name')
  const where = and(
    f.search ? like(storyline.name, `%${f.search}%`) : undefined,
    f.system ? eq(storyline.system, f.system) : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(storyline).where(where),
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
  return { rows: rows.map((r) => ({ ...r, quests: q(r.guid) })), total }
}

/** One storyline with its full node/edge graph for the flowchart view. */
export async function getStoryline(guid: number, lang: Lang) {
  const [[head], nodes, edges, variables] = await Promise.all([
    db.select().from(storyline).where(eq(storyline.guid, guid)),
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
    nodes: nodes.map((n) => ({ ...n, options: o(n.guid), rewards: r(n.guid) })),
    variables,
  }
}

// ---------------------------------------------------------------- quests

export type QuestFilter = {
  lang: Lang
  search?: string
  category?: string
  storylineGuid?: number
  guid?: number
}

/** Journal quests with their storyline, objective steps, decision options and rewards. */
export async function getQuests(f: QuestFilter & Page) {
  const nameT = localized('name')
  const sumT = localized('summary')
  const where = and(
    f.search ? like(nameT.value, `%${f.search}%`) : undefined,
    f.category ? eq(quest.category, f.category) : undefined,
    f.storylineGuid ? eq(quest.storylineGuid, f.storylineGuid) : undefined,
    f.guid ? eq(quest.guid, f.guid) : undefined,
  )
  const { limit, offset } = paginate(f)
  const [[{ total }], rows] = await Promise.all([
    db
      .select({ total: count() })
      .from(quest)
      .leftJoin(nameT, on(nameT, quest.nameText, f.lang))
      .where(where),
    db
      .select({
        category: quest.category,
        guid: quest.guid,
        icon: quest.icon,
        name: nameT.value,
        storyline: {
          guid: storyline.guid,
          name: storyline.name,
          system: storyline.system,
        },
        summary: sumT.value,
      })
      .from(quest)
      .leftJoin(nameT, on(nameT, quest.nameText, f.lang))
      .leftJoin(sumT, on(sumT, quest.summaryText, f.lang))
      .leftJoin(storyline, eq(storyline.guid, quest.storylineGuid))
      .where(where)
      .orderBy(asc(nameT.value), asc(quest.guid))
      .limit(limit)
      .offset(offset),
  ])
  const nodes = await nodeRows(
    inArray(
      questNode.questGuid,
      rows.map((r) => r.guid),
    ),
    f.lang,
  )
  const [rewards, options] = await Promise.all([
    rewardRows(
      nodes.map((n) => n.guid),
      f.lang,
    ),
    optionRows(
      nodes.filter((n) => n.type === 'Decision').map((n) => n.guid),
      f.lang,
    ),
  ])
  const rew = groupBy(rewards, 'nodeGuid')
  const opt = groupBy(options, 'decisionGuid')
  const steps = groupBy(
    nodes.map((node) => ({
      ...node,
      options: opt(node.guid),
      rewards: rew(node.guid),
    })),
    'questGuid',
  )
  return { rows: rows.map((q) => ({ ...q, steps: steps(q.guid) })), total }
}

export async function getQuest(guid: number, lang: Lang) {
  return (await getQuests({ guid, lang })).rows[0] ?? null
}
