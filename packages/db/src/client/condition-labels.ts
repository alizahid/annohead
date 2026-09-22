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
    ConditionAlwaysTrue: 'Immer',
    ConditionCompareVariable: '{variant}',
    ConditionDiplomacyState: '{variant} mit {name}',
    ConditionDominantPatron: '{name} ist die vorherrschende Gottheit',
    ConditionEmperorRelation: 'Verhältnis zum Kaiser: {variant}',
    ConditionFestivalActive: 'Ein Fest findet statt',
    ConditionInStorage: '{name} im Lager',
    ConditionItemUsed: 'Ausgerüstete Spezialisten',
    ConditionMonumentEventActive: '{name} findet statt',
    ConditionNeedAttributeCounter: '{variant} auf der Insel',
    ConditionObjectCount: '{name} im Gebiet',
    ConditionPlayerCounter: '{variant}',
    'ConditionPlayerCounter:GoodsInStock': '{name} im Lager',
    'ConditionPlayerCounter:ItemsInStock': '{name} im Lager',
    'ConditionPlayerCounter:PopulationByGroup': 'Bevölkerung: {name}',
    ConditionRaceOutcome: '{name} gewinnen', // the only race outcome checked is finishing first
    ConditionReligion: '{name} verehren',
    ConditionTradeRouteCount: 'Handelsrouten',
    ConditionWarState: 'Kriegslage: {variant}',
  },
  en: {
    ConditionActiveEmperor: '{name} is the reigning emperor',
    ConditionAlwaysTrue: 'Always',
    ConditionCompareVariable: '{variant}',
    ConditionDiplomacyState: '{variant} with {name}',
    ConditionDominantPatron: '{name} is the dominant patron',
    ConditionEmperorRelation: 'Emperor relation: {variant}',
    ConditionFestivalActive: 'A festival is active',
    ConditionInStorage: '{name} in storage',
    ConditionItemUsed: 'Specialists equipped',
    ConditionMonumentEventActive: '{name} is running',
    ConditionNeedAttributeCounter: '{variant} on the island',
    ConditionObjectCount: '{name} in the area',
    ConditionPlayerCounter: '{variant}',
    'ConditionPlayerCounter:GoodsInStock': '{name} in stock',
    'ConditionPlayerCounter:ItemsInStock': '{name} in stock',
    'ConditionPlayerCounter:PopulationByGroup': '{name} population',
    ConditionRaceOutcome: 'Win {name}',
    ConditionReligion: 'Worship {name}',
    ConditionTradeRouteCount: 'Trade routes',
    ConditionWarState: 'War state: {variant}',
  },
}

const variants: Record<Lang, Record<string, string>> = {
  de: {
    ActiveEmperorReputation: 'Ansehen beim Kaiser',
    Alliance: 'Bündnis',
    ArmyStrength: 'Heeresstärke',
    ChallengeZone: 'Herausforderung',
    CloseToWin: 'Kurz vor dem Sieg',
    ContractsCompleted: 'Erfüllte Verträge',
    Dominating: 'Überlegen',
    EffortZone: 'Bemühung',
    GoodsInStock: 'Waren im Lager',
    IslandsDiscovered: 'Entdeckte Inseln',
    ItemsInStock: 'Items im Lager',
    MoneyBalance: 'Vermögen',
    NavalStrength: 'Flottenstärke',
    Peace: 'Frieden',
    PopularityMax: 'Höchste Beliebtheit',
    PopulationByGroup: 'Bevölkerung',
    Rebellion: 'Rebellion',
    RebellionPending: 'Drohende Rebellion',
    ShipsSoldToParticipant: 'Verkaufte Schiffe',
    Struggling: 'Bedrängt',
  },
  en: {
    ActiveEmperorReputation: 'Emperor reputation',
    Alliance: 'Alliance',
    ArmyStrength: 'Army strength',
    ChallengeZone: 'Challenge zone',
    CloseToWin: 'Close to victory',
    ContractsCompleted: 'Contracts completed',
    Dominating: 'Dominating',
    EffortZone: 'Effort zone',
    GoodsInStock: 'Goods in stock',
    IslandsDiscovered: 'Islands discovered',
    ItemsInStock: 'Items in stock',
    MoneyBalance: 'Money balance',
    NavalStrength: 'Naval strength',
    Peace: 'Peace',
    PopularityMax: 'Maximum popularity',
    PopulationByGroup: 'Population',
    Rebellion: 'Rebellion',
    RebellionPending: 'Rebellion pending',
    ShipsSoldToParticipant: 'Ships sold',
    Struggling: 'Struggling',
  },
}

const TEMPLATE_PREFIX = /^Condition/

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

/** Human-readable requirement, e.g. "Worship Cernunnos" or "Ships in the area (at most)". */
export function conditionLabel(
  { type, name, variant, comparison }: Parts,
  lang: Lang,
) {
  const phrase =
    phrases[lang][`${type}:${variant}`] ??
    phrases[lang][type] ??
    type.replace(TEMPLATE_PREFIX, '')
  const label = phrase
    .replace('{name}', name ?? '')
    .replace('{variant}', variant ? variantLabel(variant, lang) : '')
    .replace(/\s+/g, ' ')
    .trim()
  return comparison === 'AtMost' || comparison === 'LessThan'
    ? `${label} (${atMost[lang]})`
    : label
}
