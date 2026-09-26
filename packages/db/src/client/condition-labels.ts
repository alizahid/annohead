import { type ConditionTemplate, type LabelKind, type Lang } from '../enums'
import { type Labels } from './labels'

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
    ConditionActiveIncidentCount: '{variant} aktiv',
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
    ConditionActiveIncidentCount: '{variant} active',
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

/** Variants the game has no name for: statistics, war states … (the rest come from its own tables, see `VARIANT_KINDS`) */
const variants: Record<Lang, Record<string, string>> = {
  de: {
    ActiveEmperorReputation: 'Ansehen beim Kaiser',
    AllAttributes: 'alle Eigenschaften',
    ArmyStrength: 'Heeresstärke',
    CloseToWin: 'Kurz vor dem Sieg',
    ContractsCompleted: 'Erfüllte Verträge',
    Dominating: 'Überlegen',
    GoodsInStock: 'Waren im Lager',
    IncidentResolved: 'Gelöste Vorfälle',
    IslandSettled: 'Besiedelte Inseln',
    IslandsDiscovered: 'Entdeckte Inseln',
    ItemsInStock: 'Items im Lager',
    MoneyBalance: 'Vermögen',
    MonumentEventsFinished: 'Abgeschlossene Monument-Ereignisse',
    NavalStrength: 'Flottenstärke',
    PopularityMax: 'Höchste Beliebtheit',
    QuestComponentEnded: 'Questschritt abgeschlossen',
    RebellionPending: 'Drohende Rebellion',
    ShipsSoldToParticipant: 'Verkaufte Schiffe',
    Struggling: 'Bedrängt',
  },
  en: {
    ActiveEmperorReputation: 'Emperor reputation',
    AllAttributes: 'all attributes',
    ArmyStrength: 'Army strength',
    CloseToWin: 'Close to victory',
    ContractsCompleted: 'Contracts completed',
    Dominating: 'Dominating',
    GoodsInStock: 'Goods in stock',
    IncidentResolved: 'Incidents resolved',
    IslandSettled: 'Islands settled',
    IslandsDiscovered: 'Islands discovered',
    ItemsInStock: 'Items in stock',
    MoneyBalance: 'Money balance',
    MonumentEventsFinished: 'Monument events finished',
    NavalStrength: 'Naval strength',
    PopularityMax: 'Maximum popularity',
    QuestComponentEnded: 'Quest step completed',
    RebellionPending: 'Rebellion pending',
    ShipsSoldToParticipant: 'Ships sold',
    Struggling: 'Struggling',
  },
}

/** Which game table names a template's variant: the emperor relation's Rebellion is the Rebel state, an incident's the Uprising */
const VARIANT_KINDS: Partial<Record<ConditionTemplate, LabelKind>> = {
  ConditionActiveIncidentCount: 'incident',
  ConditionDiplomacyState: 'diplomacy',
  ConditionEmperorRelation: 'reputation',
  ConditionItemRacerAttribute: 'racer_attribute',
}

/** player counters that count an attribute's group */
const ATTRIBUTE_ALIASES: Record<string, string> = {
  PopulationByGroup: 'Population',
}

const TEMPLATE_PREFIX = /^Condition/

const atMost: Record<Lang, string> = {
  de: 'höchstens',
  en: 'at most',
}

/** The game's name for each `;`-separated variant, else ours, else the raw key */
function variantLabel(
  type: ConditionTemplate,
  variant: string,
  lang: Lang,
  l: Labels,
) {
  const kind = VARIANT_KINDS[type]
  return variant
    .split(';')
    .map(
      (v) =>
        (kind ? l(kind, v) : null)?.name ??
        l('attribute', ATTRIBUTE_ALIASES[v] ?? v)?.name ??
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
  l: Labels,
) {
  const label = (
    phrase(type, variant, lang) ?? type.replace(TEMPLATE_PREFIX, '')
  )
    .replace('{name}', name ?? '')
    .replace('{variant}', variant ? variantLabel(type, variant, lang, l) : '')
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
