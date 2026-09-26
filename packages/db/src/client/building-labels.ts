import { type BuildingKind, buildingKindValues, type Lang } from '../enums'

const kindNames: Record<Lang, Record<BuildingKind, string>> = {
  de: {
    Aqueduct: 'Aquädukt',
    'City Watch': 'Stadtwache',
    Harbour: 'Hafen',
    Marsh: 'Sumpf',
    Military: 'Militär',
    Monument: 'Monument',
    Production: 'Produktion',
    'Public Service': 'Öffentlicher Dienst',
    Residence: 'Wohnhaus',
    Road: 'Straße',
  },
  en: {
    Aqueduct: 'Aqueduct',
    'City Watch': 'City Watch',
    Harbour: 'Harbour',
    Marsh: 'Marsh',
    Military: 'Military',
    Monument: 'Monument',
    Production: 'Production',
    'Public Service': 'Public Service',
    Residence: 'Residence',
    Road: 'Road',
  },
}

export function kindLabel(key: BuildingKind | null, lang: Lang) {
  return key === null
    ? null
    : {
        key,
        name: kindNames[lang][key],
      }
}

export function kinds({ lang }: { lang: Lang }) {
  return buildingKindValues.map((key) => ({
    key,
    name: kindNames[lang][key],
  }))
}
