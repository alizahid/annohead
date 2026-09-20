import {
  type BuildingKind,
  type BuildingType,
  buildingKindValues,
  buildingTypeValues,
  type Lang,
} from '../enums'

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

const typeNames: Record<Lang, Record<BuildingType, string>> = {
  de: {
    Factory: 'Fabrik',
    Logistic: 'Logistik',
    Other: 'Sonstiges',
    Public: 'Öffentlichkeit',
    Residence: 'Wohnhaus',
    Warehouse: 'Lagerhaus',
  },
  en: {
    Factory: 'Factory',
    Logistic: 'Logistic',
    Other: 'Other',
    Public: 'Public',
    Residence: 'Residence',
    Warehouse: 'Warehouse',
  },
}

export function kindLabel(id: BuildingKind | null, lang: Lang) {
  return id === null ? null : { id, name: kindNames[lang][id] }
}

export function typeLabel(id: BuildingType | null, lang: Lang) {
  return id === null ? null : { id, name: typeNames[lang][id] }
}

export function kinds({ lang }: { lang: Lang }) {
  return buildingKindValues.map((key) => ({
    key,
    name: kindNames[lang][key],
  }))
}

export function types({ lang }: { lang: Lang }) {
  return buildingTypeValues.map((key) => ({
    key,
    name: typeNames[lang][key],
  }))
}
