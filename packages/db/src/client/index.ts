import { buildings } from './buildings'
import { captains, items, specialists } from './items'
import { products } from './products'
import { quests, storylines } from './quests'
import { techs } from './techs'

export type { BuildingFilter } from './buildings'
export type { ItemFilter } from './items'
export type { ProductFilter } from './products'
export type { QuestFilter, StorylineFilter } from './quests'
export type { Get, Page } from './shared'
export type { TechFilter } from './techs'

export const anno = {
  buildings,
  captains,
  items,
  products,
  quests,
  specialists,
  storylines,
  techs,
}
