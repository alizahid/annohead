import { buildings } from './buildings'
import { chains } from './chains'
import { captains, items, specialists } from './items'
import { products } from './products'
import { quests, storylines } from './quests'
import { search } from './search'
import { techs } from './techs'

export type { BuildingFilter } from './buildings'
export type { ChainFilter } from './chains'
export type { ItemFilter } from './items'
export type { ProductFilter } from './products'
export type { QuestFilter, StorylineFilter } from './quests'
export type { SearchFilter, SearchHit } from './search'
export type { Get, Page } from './shared'
export type { TechFilter } from './techs'

export const anno = {
  buildings,
  captains,
  chains,
  items,
  products,
  quests,
  search,
  specialists,
  storylines,
  techs,
}
