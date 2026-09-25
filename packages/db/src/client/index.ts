import { buildings } from './buildings'
import { chains } from './chains'
import { dlc } from './dlc'
import { captains, items, specialists } from './items'
import { populationTiers } from './population-tiers'
import { products } from './products'
import { quests, storylines } from './quests'
import { regions } from './regions'
import { search } from './search'
import { techs } from './techs'

export type { BuildingFilter } from './buildings'
export type { ChainFilter } from './chains'
export type { DlcFilter } from './dlc'
export type { ItemFilter } from './items'
export type { PopulationTierFilter } from './population-tiers'
export type { ProductFilter } from './products'
export type { QuestFilter, StorylineFilter } from './quests'
export type { RegionFilter } from './regions'
export type { SearchFilter, SearchHit } from './search'
export type { Get, Page } from './shared'
export type { TechFilter } from './techs'

export type Buildings = Awaited<ReturnType<typeof buildings.list>>
export type Building = Awaited<ReturnType<typeof buildings.get>>
export type BuildingCategories = Awaited<
  ReturnType<typeof buildings.categories>
>
export type BuildingKinds = Awaited<ReturnType<typeof buildings.kinds>>
export type BuildingTypes = Awaited<ReturnType<typeof buildings.types>>
export type Captains = Awaited<ReturnType<typeof captains.list>>
export type Captain = Awaited<ReturnType<typeof captains.get>>
export type Chains = Awaited<ReturnType<typeof chains.list>>
export type Chain = Awaited<ReturnType<typeof chains.get>>
export type Dlcs = Awaited<ReturnType<typeof dlc.list>>
export type Items = Awaited<ReturnType<typeof items.list>>
export type Item = Awaited<ReturnType<typeof items.get>>
export type ItemAllocations = Awaited<ReturnType<typeof items.allocations>>
export type ItemNiches = Awaited<ReturnType<typeof items.niches>>
export type ItemRarities = Awaited<ReturnType<typeof items.rarities>>
export type ItemTypes = Awaited<ReturnType<typeof items.types>>
export type PopulationTiers = Awaited<ReturnType<typeof populationTiers.list>>
export type Products = Awaited<ReturnType<typeof products.list>>
export type Product = Awaited<ReturnType<typeof products.get>>
export type Quests = Awaited<ReturnType<typeof quests.list>>
export type Quest = Awaited<ReturnType<typeof quests.get>>
export type Regions = Awaited<ReturnType<typeof regions.list>>
export type SearchResults = Awaited<ReturnType<typeof search>>
export type Specialists = Awaited<ReturnType<typeof specialists.list>>
export type Specialist = Awaited<ReturnType<typeof specialists.get>>
export type Storylines = Awaited<ReturnType<typeof storylines.list>>
export type Storyline = Awaited<ReturnType<typeof storylines.get>>
export type Techs = Awaited<ReturnType<typeof techs.list>>
export type Tech = Awaited<ReturnType<typeof techs.get>>
export type TechCategories = Awaited<ReturnType<typeof techs.categories>>

export const anno = {
  buildings,
  captains,
  chains,
  dlc,
  items,
  populationTiers,
  products,
  quests,
  regions,
  search,
  specialists,
  storylines,
  techs,
}
