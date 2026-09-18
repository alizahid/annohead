const icons = {
  building: 'data/ui/fhd/base/icon_content/generic/icon_2d_category_house.png',
  Celtic: 'data/ui/fhd/base/icon_content/generic/icon_2d_region_wetlands.png',
  chain:
    'data/ui/fhd/base/icon_content/generic/icon_2d_generic_construction_chain.png',
  Egyptian: 'data/ui/fhd/base/icon_content/generic/icon_2d_region_global.png',
  item: 'data/ui/fhd/base/icon_content/generic/icon_2d_generic_item.png',
  product: 'data/ui/fhd/base/icon_content/generic/icon_2d_generic_goods.png',
  quest: 'data/ui/fhd/base/icon_content/generic/icon_2d_questlog.png',
  Roman: 'data/ui/fhd/base/icon_content/generic/icon_2d_region_heartlands.png',
  tech: 'data/ui/fhd/base/icon_content/generic/icon_2d_research.png',
} as const

export function getIcon(name: keyof typeof icons) {
  return `${process.env.NEXT_PUBLIC_CDN_URL}/${icons[name]}`
}

export function getIconUrl(icon: string) {
  return `${process.env.NEXT_PUBLIC_CDN_URL}/${icon}`
}
