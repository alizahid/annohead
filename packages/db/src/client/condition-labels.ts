import { type ConditionTemplate, type Lang } from '../enums'
import { attributeName } from './attribute-labels'

type Parts = {
  type: ConditionTemplate
  /** localized name of the referenced asset, if any */
  name: string | null
  /** raw variant parameter, `;`-separated when the game lists several states */
  variant: string | null
  /** `AtMost` / `LessThan` when the threshold is an upper bound */
  comparison: string | null
}

/** `{name}` and `{variant}` are filled from the condition; a phrase keyed `Template:Variant` wins over `Template`. */
const phrases: Record<Lang, Record<string, string>> = {
  de: {
    ConditionActiveEmperor: '{name} regiert als Kaiser',
    'ConditionActiveIncidentCount:Inferno': 'Ein Großbrand wütet',
    'ConditionActiveIncidentCount:Plague': 'Eine Seuche breitet sich aus',
    'ConditionActiveIncidentCount:Rebellion': 'Eine Rebellion ist im Gange',
    ConditionActiveSession: 'In {name}',
    ConditionAlwaysFalse: 'Nie',
    ConditionAlwaysTrue: 'Immer',
    ConditionAreaOwnedByHuman: 'Gebiet in deinem Besitz',
    ConditionCompareVariable: '{variant}',
    ConditionDiplomacyState: '{variant} mit {name}',
    ConditionDominantPatron: '{name} ist die vorherrschende Gottheit',
    ConditionEmperorRelation: 'Verhältnis zum Kaiser: {variant}',
    ConditionFestivalActive: 'Ein Fest findet statt',
    ConditionInStorage: '{name} im Lager',
    ConditionIsCampaign: 'Kampagne',
    ConditionIsDiscovered: '{name} entdeckt',
    ConditionIsMaleProtagonist: 'Männlicher Statthalter',
    ConditionIsParticipantInGame: '{name} ist im Spiel',
    ConditionItemRacerAttribute: 'Rennpferd: {variant} maximal',
    ConditionItemUsed: 'Ausgerüstete Spezialisten',
    ConditionMonumentEventActive: '{name} findet statt',
    ConditionNeedAttributeCounter: '{variant} auf der Insel',
    ConditionObjectCount: '{name} im Gebiet',
    ConditionPlayerCounter: '{variant}',
    'ConditionPlayerCounter:GoodsInStock': '{name} im Lager',
    'ConditionPlayerCounter:ItemsInStock': '{name} im Lager',
    'ConditionPlayerCounter:ObjectCount': '{name} im Besitz',
    'ConditionPlayerCounter:PopulationByGroup': 'Bevölkerung: {name}',
    'ConditionPlayerCounter:PopulationByLevel': '{name}-Bevölkerung',
    'ConditionPlayerCounter:QuestComponentCreated': 'Questschritt begonnen',
    'ConditionPlayerCounter:QuestObjectiveComponentSolved': 'Questziel erfüllt',
    ConditionRaceOutcome: '{name} gewinnen', // the only race outcome checked is finishing first
    ConditionReligion: '{name} verehren',
    ConditionTechResearched: '{name} erforscht',
    ConditionTimer: 'Zeit abgelaufen',
    ConditionTradeRouteCount: 'Handelsrouten',
    ConditionUnlocked: '{name} freigeschaltet',
    ConditionVolcanoPhaseActive: 'Vulkan: {name}',
    ConditionWarState: 'Kriegslage: {variant}',
  },
  en: {
    ConditionActiveEmperor: '{name} is the reigning emperor',
    'ConditionActiveIncidentCount:Inferno': 'An inferno is raging',
    'ConditionActiveIncidentCount:Plague': 'A plague is spreading',
    'ConditionActiveIncidentCount:Rebellion': 'A rebellion is under way',
    ConditionActiveSession: 'In {name}',
    ConditionAlwaysFalse: 'Never',
    ConditionAlwaysTrue: 'Always',
    ConditionAreaOwnedByHuman: 'Area owned by you',
    ConditionCompareVariable: '{variant}',
    ConditionDiplomacyState: '{variant} with {name}',
    ConditionDominantPatron: '{name} is the dominant patron',
    ConditionEmperorRelation: 'Emperor relation: {variant}',
    ConditionFestivalActive: 'A festival is active',
    ConditionInStorage: '{name} in storage',
    ConditionIsCampaign: 'Campaign game',
    ConditionIsDiscovered: '{name} discovered',
    ConditionIsMaleProtagonist: 'Male governor',
    ConditionIsParticipantInGame: '{name} is in the game',
    ConditionItemRacerAttribute: 'Horse {variant} at maximum',
    ConditionItemUsed: 'Specialists equipped',
    ConditionMonumentEventActive: '{name} is running',
    ConditionNeedAttributeCounter: '{variant} on the island',
    ConditionObjectCount: '{name} in the area',
    ConditionPlayerCounter: '{variant}',
    'ConditionPlayerCounter:GoodsInStock': '{name} in stock',
    'ConditionPlayerCounter:ItemsInStock': '{name} in stock',
    'ConditionPlayerCounter:ObjectCount': '{name} owned',
    'ConditionPlayerCounter:PopulationByGroup': '{name} population',
    'ConditionPlayerCounter:PopulationByLevel': '{name} population',
    'ConditionPlayerCounter:QuestComponentCreated': 'Quest step started',
    'ConditionPlayerCounter:QuestObjectiveComponentSolved':
      'Quest objective completed',
    ConditionRaceOutcome: 'Win {name}',
    ConditionReligion: 'Worship {name}',
    ConditionTechResearched: '{name} researched',
    ConditionTimer: 'Time runs out',
    ConditionTradeRouteCount: 'Trade routes',
    ConditionUnlocked: '{name} unlocked',
    ConditionVolcanoPhaseActive: 'Volcano: {name}',
    ConditionWarState: 'War state: {variant}',
  },
}

const variants: Record<Lang, Record<string, string>> = {
  de: {
    ActiveEmperorReputation: 'Ansehen beim Kaiser',
    AllAttributes: 'alle Eigenschaften',
    Alliance: 'Bündnis',
    ArmyStrength: 'Heeresstärke',
    Boost: 'Spurt',
    ChallengeZone: 'Herausforderung',
    CloseToWin: 'Kurz vor dem Sieg',
    Consistency: 'Beständigkeit',
    ContractsCompleted: 'Erfüllte Verträge',
    DefensivePact: 'Verteidigungspakt',
    Dominating: 'Überlegen',
    EffortZone: 'Bemühung',
    GoodsInStock: 'Waren im Lager',
    IncidentResolved: 'Gelöste Vorfälle',
    IslandSettled: 'Besiedelte Inseln',
    IslandsDiscovered: 'Entdeckte Inseln',
    ItemsInStock: 'Items im Lager',
    MoneyBalance: 'Vermögen',
    MonumentEventsFinished: 'Abgeschlossene Monument-Ereignisse',
    NavalStrength: 'Flottenstärke',
    Peace: 'Frieden',
    PopularityMax: 'Höchste Beliebtheit',
    PopulationByGroup: 'Bevölkerung',
    QuestComponentEnded: 'Questschritt abgeschlossen',
    Rebellion: 'Rebellion',
    RebellionPending: 'Drohende Rebellion',
    ShipsSoldToParticipant: 'Verkaufte Schiffe',
    Speed: 'Tempo',
    Stamina: 'Ausdauer',
    Struggling: 'Bedrängt',
    War: 'Krieg',
  },
  en: {
    ActiveEmperorReputation: 'Emperor reputation',
    AllAttributes: 'all attributes',
    Alliance: 'Alliance',
    ArmyStrength: 'Army strength',
    Boost: 'boost',
    ChallengeZone: 'Challenge zone',
    CloseToWin: 'Close to victory',
    Consistency: 'consistency',
    ContractsCompleted: 'Contracts completed',
    DefensivePact: 'Defensive pact',
    Dominating: 'Dominating',
    EffortZone: 'Effort zone',
    GoodsInStock: 'Goods in stock',
    IncidentResolved: 'Incidents resolved',
    IslandSettled: 'Islands settled',
    IslandsDiscovered: 'Islands discovered',
    ItemsInStock: 'Items in stock',
    MoneyBalance: 'Money balance',
    MonumentEventsFinished: 'Monument events finished',
    NavalStrength: 'Naval strength',
    Peace: 'Peace',
    PopularityMax: 'Maximum popularity',
    PopulationByGroup: 'Population',
    QuestComponentEnded: 'Quest step completed',
    Rebellion: 'Rebellion',
    RebellionPending: 'Rebellion pending',
    ShipsSoldToParticipant: 'Ships sold',
    Speed: 'speed',
    Stamina: 'stamina',
    Struggling: 'Struggling',
    War: 'War',
  },
}

const TEMPLATE_PREFIX = /^Condition/

/** Racer attributes share the condition variant labels: "speed", "stamina" … */
export function racerAttributeLabel(attribute: string, lang: Lang) {
  return variants[lang][attribute] ?? attribute
}

const atMost: Record<Lang, string> = {
  de: 'höchstens',
  en: 'at most',
}

/** Attribute keys share their labels with the rest of the site; everything else comes from `variants`. */
function variantLabel(variant: string, lang: Lang) {
  return variant
    .split(';')
    .map(
      (v) =>
        attributeName(v as Parameters<typeof attributeName>[0], lang) ??
        variants[lang][v] ??
        v,
    )
    .join(', ')
}

function phrase(type: ConditionTemplate, variant: string | null, lang: Lang) {
  return phrases[lang][`${type}:${variant}`] ?? phrases[lang][type]
}

/** Whether a condition's phrase names an asset ("{name} unlocked"); without one it reads as nothing. */
export function phraseNeedsName(
  type: ConditionTemplate,
  variant: string | null,
) {
  return phrase(type, variant, 'en')?.includes('{name}') ?? false
}

/** Human-readable requirement, e.g. "Worship Cernunnos" or "Ships in the area (at most)". */
export function conditionLabel(
  { type, name, variant, comparison }: Parts,
  lang: Lang,
) {
  const label = (
    phrase(type, variant, lang) ?? type.replace(TEMPLATE_PREFIX, '')
  )
    .replace('{name}', name ?? '')
    .replace('{variant}', variant ? variantLabel(variant, lang) : '')
    .replace(/\s+/g, ' ')
    .trim()
  return comparison === 'AtMost' || comparison === 'LessThan'
    ? `${label} (${atMost[lang]})`
    : label
}

const not: Record<Lang, string> = {
  de: 'Nicht',
  en: 'Not',
}

export function negatedLabel(label: string, lang: Lang) {
  return `${not[lang]}: ${label}`
}

const VARIABLE_WORD_BREAK = /(?<=[a-z])(?=[A-Z0-9])|(?<=[0-9])(?=[A-Z])/g

/**
 * Quest variables are internal identifiers ("Colosseum_PatricianFavor", "Colosseum_StoryS6_done"); read as words
 * without the leading questline prefix ("Patrician Favor", "Story S6 done").
 */
// ponytail: English-ish in both languages; the game never shows these names, so there is nothing to localize from
export function variableName(raw: string) {
  const parts = raw.split('_').filter(Boolean)
  return (parts.length > 1 ? parts.slice(1) : parts)
    .join(' ')
    .replace(VARIABLE_WORD_BREAK, ' ')
}

const operators: Record<string, string> = {
  AtLeast: '≥',
  AtMost: '≤',
  Equals: '=',
  LessThan: '<',
  MoreThan: '>',
}

/** "Patrician Favor ≥ Neutral Favor", "Mega Reward = 2", "Killed Favillus" or "Not: Story S6 done" */
export function variableCheckLabel(
  {
    variable,
    comparison,
    value,
    other,
  }: {
    variable: string
    comparison: string
    /** `true` / `false` for flags */
    value: string
    /** compared against another variable instead of a value */
    other: string | null
  },
  lang: Lang,
) {
  const name = variableName(variable)
  if (other) {
    return `${name} ${operators[comparison] ?? comparison} ${variableName(other)}`
  }
  if (value === 'true' || value === 'false') {
    return (value === 'true') === (comparison !== 'LessThan')
      ? name
      : negatedLabel(name, lang)
  }
  return `${name} ${operators[comparison] ?? comparison} ${value}`
}

const yes: Record<Lang, [string, string]> = {
  de: ['ja', 'nein'],
  en: ['yes', 'no'],
}

const changeSigns: Record<string, string> = {
  Add: '+',
  Multiply: '×',
  Set: '= ',
  Subtract: '−',
}

/** "+1", "= 2", "yes", or "= Other Variable" */
export function variableChangeLabel(
  {
    operation,
    value,
    valueVariable,
  }: {
    operation: string | null
    value: string | null
    valueVariable: string | null
  },
  lang: Lang,
) {
  if (value === 'true' || value === 'false') {
    return yes[lang][value === 'true' ? 0 : 1]
  }
  const sign = changeSigns[operation ?? 'Set'] ?? ''
  return `${sign}${valueVariable ? variableName(valueVariable) : (value ?? '')}`
}

const or: Record<Lang, string> = {
  de: 'oder',
  en: 'or',
}

/** "Equites population: 150 or Nobles population: 150" */
export function anyOfLabel(labels: Array<string>, lang: Lang) {
  return labels.join(` ${or[lang]} `)
}
