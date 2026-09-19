const icons = {
  building: '/img/anno/icon_2d_category_house.png',
  Celtic: '/img/anno/icon_2d_region_wetlands.png',
  chain: '/img/anno/icon_2d_generic_construction_chain.png',
  Egyptian: '/img/anno/icon_2d_region_global.png',
  item: '/img/anno/icon_2d_generic_item.png',
  product: '/img/anno/icon_2d_generic_goods.png',
  profile: '/img/anno/icon_2d_meta_rival.png',
  quest: '/img/anno/icon_2d_questlog.png',
  Roman: '/img/anno/icon_2d_region_heartlands.png',
  tech: '/img/anno/icon_2d_research.png',
} as const

export function getIcon(name: keyof typeof icons) {
  return icons[name]
}

export function getIconUrl(icon: string) {
  return `${process.env.NEXT_PUBLIC_CDN_URL}/${icon}`
}
