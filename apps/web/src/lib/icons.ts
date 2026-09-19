const icons = {
  Aqueduct: '/img/anno/icon_2d_aqueduct_0.png',
  building: '/img/anno/icon_2d_category_house.png',
  Celtic: '/img/anno/icon_2d_region_wetlands.png',
  'City Watch': '/img/anno/icon_2d_institution_buildings_0.png',
  chain: '/img/anno/icon_2d_generic_construction_chain.png',
  DLC01_Prophecies_of_Ash: '/img/anno/icon_3d_dlc_category_volcano_0.png',
  DLC02_The_Hippodrome: '/img/anno/icon_3d_dlc_category_circus_maximus_0.png',
  DLC03_Dawn_of_Delta: '/img/anno/icon_3d_dlc_category_egypt_0.png',
  Egyptian: '/img/anno/icon_2d_region_global.png',
  Harbour: '/img/anno/icon_2d_naval_buildings_0.png',
  item: '/img/anno/icon_2d_generic_item.png',
  Marsh: '/img/anno/icon_2d_category_marsh_drainage_0.png',
  Military: '/img/anno/icon_2d_category_military_buildings_0.png',
  Monument: '/img/anno/icon_2d_colloseum_0.png',
  notFound: '/img/anno/icon_3d_sideques_roman_ruins_0.png',
  Production: '/img/anno/icon_2d_production_buildings_0.png',
  'Public Service': '/img/anno/icon_2d_category_civic_0.png',
  product: '/img/anno/icon_2d_generic_goods.png',
  profile: '/img/anno/icon_2d_meta_rival.png',
  quest: '/img/anno/icon_2d_questlog.png',
  Residence: '/img/anno/icon_2d_category_house_0.png',
  Road: '/img/anno/icon_2d_item_scope_street_0.png',
  Roman: '/img/anno/icon_2d_region_heartlands.png',
  tech: '/img/anno/icon_2d_research.png',
  tier1: '/img/anno/icon_roman_numerals_1_0.png',
  tier2: '/img/anno/icon_roman_numerals_2_0.png',
  tier3: '/img/anno/icon_roman_numerals_3_0.png',
  tier4: '/img/anno/icon_roman_numerals_4_0.png',
} as const

export function getIcon(name: keyof typeof icons) {
  return icons[name]
}

export function getDlcIcon(guid: number | null) {
  if (guid === 67_902) {
    return 'DLC01_Prophecies_of_Ash'
  }

  if (guid === 67_903) {
    return 'DLC02_The_Hippodrome'
  }

  if (guid === 67_904) {
    return 'DLC03_Dawn_of_Delta'
  }
}

export function getIconUrl(icon: string) {
  return `${process.env.NEXT_PUBLIC_CDN_URL}/${icon}`
}
