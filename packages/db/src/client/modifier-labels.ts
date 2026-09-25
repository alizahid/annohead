import { type Attribute, type Lang } from '../enums'
import { attributeName } from './attribute-labels'

/** Display names of `buff_modifier.path` values that are not population attributes. */
const modifierNames: Record<Lang, Record<string, string>> = {
  de: {
    'AqueductUpgrade.AqueductConsumedWaterUpgrade': 'Wasserverbrauch',
    'AqueductUpgrade.AqueductWaterSupplyUpgrade': 'Wasserversorgung',
    'AreaBuff.RadiusEffectRangeUpgrade': 'Wirkungsradius',
    'AreaMaintenanceUpgrade.MeshGraphUpkeep.Aqueduct.UpgradePercent':
      'Aquädukt-Unterhalt',
    'AreaMaintenanceUpgrade.MeshGraphUpkeep.Street.UpgradePercent':
      'Straßenunterhalt',
    'AreaMaintenanceUpgrade.MeshGraphUpkeep.Wall.UpgradePercent':
      'Mauerunterhalt',
    'BuildingUpgrade.AttributeModifierInPercent': 'Attributwirkung',
    'BuildingUpgrade.WorkforceModifierInPercent': 'Arbeitskraft',
    'CityInstitutionUpgrade.ResolverRangeUpgrade': 'Reichweite',
    'CityInstitutionUpgrade.ResolverRepairDurationUpgrade': 'Reparaturdauer',
    'CityInstitutionUpgrade.ResolverResolveDurationUpgrade': 'Einsatzdauer',
    'CityInstitutionUpgrade.ResolverUnitCountUpgrade': 'Einsatzeinheiten',
    'DistributionUpgrade.AddDeltas': 'Bereitgestellte Waren',
    'FactoryUpgrade.FuelDurationPercent': 'Brennstoffdauer',
    'FactoryUpgrade.NeededAreaUpgrade': 'Benötigte Fläche',
    'FactoryUpgrade.ProductivityUpgrade': 'Produktivität',
    'HealthUpgrade.BaseHealthUpgrade': 'Trefferpunkte',
    'HealthUpgrade.EncampedUnitSelfHealMultiplierUpgrade': 'Heilung im Lager',
    'HealthUpgrade.SelfHealUpgrade': 'Selbstreparatur',
    'IrrigationUpgrade.PipeCapacityUpgrade': 'Kanalkapazität',
    'ItemContainerUpgrade.SlotCountUpgrade': 'Frachtplätze',
    'ItemContainerUpgrade.SocketCountUpgrade': 'Gegenstandsplätze',
    'MaintenanceUpgrade.EncampedUnitScalingFactorUpgrade': 'Lagerunterhalt',
    'MaintenanceUpgrade.MaintenanceFactorUpgrade': 'Unterhalt',
    'MaintenanceUpgrade.WorkforceMaintenanceFactorUpgrade':
      'Benötigte Arbeitskraft',
    'ModuleOwnerUpgrade.ModuleLimitPercent': 'Modullimit',
    'MovementUpgrade.BuffBaseSpeedUpgrade': 'Geschwindigkeit',
    'MovementUpgrade.BuffFavorableWindAngle': 'Günstiger Windwinkel',
    'MovementUpgrade.BuffReduceCargoImpactUpgrade':
      'Verlangsamung durch Fracht',
    'MovementUpgrade.BuffReduceDamageImpactUpgrade':
      'Verlangsamung durch Schaden',
    'MovementUpgrade.BuffReduceNegativeWindImpactUpgrade':
      'Verlangsamung durch Gegenwind',
    'MovementUpgrade.BuffTransferSpeedUpgrade': 'Umladegeschwindigkeit',
    'RaceTrackUpgrades.TrainingChargesUpgrade': 'Trainingsladungen',
    'RecruitmentUpgrade.ConstructionCostInPercent': 'Baukosten',
    'RecruitmentUpgrade.ConstructionSpeedInPercent': 'Baugeschwindigkeit',
    'RecruitmentUpgrade.RecruitmentCostInPercent': 'Rekrutierungskosten',
    'RecruitmentUpgrade.RecruitmentSpeedInPercent':
      'Rekrutierungsgeschwindigkeit',
    'RepairCraneUpgrade.HealBuildingsPerMinuteUpgrade':
      'Gebäudereparatur pro Minute',
    'RepairCraneUpgrade.HealPerMinuteUpgrade': 'Schiffsreparatur pro Minute',
    'RepairCraneUpgrade.HealRadiusUpgrade': 'Reparaturradius',
    'RepairCraneUpgrade.MaximumRepairTargetsUpgrade': 'Reparaturziele',
    'ResidenceUpgrade.ConsumptionModifierInPercent': 'Verbrauch',
    'ResidenceUpgrade.GoodConsumptionUpgrade.AmountInPercent': 'Verbrauch',
    'TradeShipUpgrade.ActiveTradePriceInPercent': 'Handelspreis',
    'TradeShipUpgrade.LoadingSpeedUpgrade': 'Ladegeschwindigkeit',
    'UnitUpgrade.AccuracyArcherModuleUpgrade': 'Genauigkeit der Bogenschützen',
    'UnitUpgrade.AccuracyBallistaModuleUpgrage': 'Genauigkeit der Ballisten',
    'UnitUpgrade.AccuracyCatapultModuleUpgrage': 'Genauigkeit der Katapulte',
    'UnitUpgrade.AccuracyUpgrade': 'Genauigkeit',
    'UnitUpgrade.ArmorUpgrade': 'Rüstung',
    'UnitUpgrade.AttackCone_BallistaModule': 'Angriffswinkel der Ballisten',
    'UnitUpgrade.AttackCone_CatapultModule': 'Angriffswinkel der Katapulte',
    'UnitUpgrade.AttackSpeedArcherModulePercentualUpgrade':
      'Angriffstempo der Bogenschützen',
    'UnitUpgrade.AttackSpeedBallistaModulePercentualUpgrade':
      'Angriffstempo der Ballisten',
    'UnitUpgrade.AttackSpeedCatapultModulePercentualUpgrade':
      'Angriffstempo der Katapulte',
    'UnitUpgrade.AttackSpeedRangedPercentualUpgrade': 'Fernkampf-Angriffstempo',
    'UnitUpgrade.AttackSpeedTorchPercentualUpgrade':
      'Angriffstempo der Fackeln',
    'UnitUpgrade.DefenseUpgrade': 'Verteidigung',
    'UnitUpgrade.DiscoveryRadiusUpgrade': 'Sichtweite',
    'UnitUpgrade.DistanceAttackRangeArcherModulePercentualUpgrade':
      'Reichweite der Bogenschützen',
    'UnitUpgrade.DistanceAttackRangeBallistaModulePercentualUpgrade':
      'Reichweite der Ballisten',
    'UnitUpgrade.DistanceAttackRangeCatapultModulePercentualUpgrade':
      'Reichweite der Katapulte',
    'UnitUpgrade.DistanceAttackRangePercentualUpgrade': 'Angriffsreichweite',
    'UnitUpgrade.MaximumMoraleUpgrade': 'Maximale Moral',
    'UnitUpgrade.OffenseArcherModuleRangedUpgrade': 'Schaden der Bogenschützen',
    'UnitUpgrade.OffenseBallistaModuleRangedUpgrade': 'Schaden der Ballisten',
    'UnitUpgrade.OffenseCatapultModuleRangedUpgrade': 'Schaden der Katapulte',
    'UnitUpgrade.OffenseChargeUpgrade': 'Sturmangriffsschaden',
    'UnitUpgrade.OffenseMeleeUpgrade': 'Nahkampfschaden',
    'UnitUpgrade.OffenseRangedUpgrade': 'Fernkampfschaden',
    'UnitUpgrade.RewardMoneyPerDestroyedShipUpgrade':
      'Belohnung pro versenktem Schiff',
    'UnitUpgrade.ShieldUpgrade': 'Schild',
    'WarehouseUpgrade.AdditionalLoadingSpeedInPercent': 'Ladegeschwindigkeit',
  },
  en: {
    'AqueductUpgrade.AqueductConsumedWaterUpgrade': 'Water consumption',
    'AqueductUpgrade.AqueductWaterSupplyUpgrade': 'Water supply',
    'AreaBuff.RadiusEffectRangeUpgrade': 'Effect radius',
    'AreaMaintenanceUpgrade.MeshGraphUpkeep.Aqueduct.UpgradePercent':
      'Aqueduct upkeep',
    'AreaMaintenanceUpgrade.MeshGraphUpkeep.Street.UpgradePercent':
      'Road upkeep',
    'AreaMaintenanceUpgrade.MeshGraphUpkeep.Wall.UpgradePercent': 'Wall upkeep',
    'BuildingUpgrade.AttributeModifierInPercent': 'Attribute effects',
    'BuildingUpgrade.WorkforceModifierInPercent': 'Workforce',
    'CityInstitutionUpgrade.ResolverRangeUpgrade': 'Range',
    'CityInstitutionUpgrade.ResolverRepairDurationUpgrade': 'Repair time',
    'CityInstitutionUpgrade.ResolverResolveDurationUpgrade':
      'Incident resolution time',
    'CityInstitutionUpgrade.ResolverUnitCountUpgrade': 'Service units',
    'DistributionUpgrade.AddDeltas': 'Provided goods',
    'FactoryUpgrade.FuelDurationPercent': 'Fuel duration',
    'FactoryUpgrade.NeededAreaUpgrade': 'Required area',
    'FactoryUpgrade.ProductivityUpgrade': 'Productivity',
    'HealthUpgrade.BaseHealthUpgrade': 'Hit points',
    'HealthUpgrade.EncampedUnitSelfHealMultiplierUpgrade':
      'Healing in encampments',
    'HealthUpgrade.SelfHealUpgrade': 'Self-repair',
    'IrrigationUpgrade.PipeCapacityUpgrade': 'Channel capacity',
    'ItemContainerUpgrade.SlotCountUpgrade': 'Cargo slots',
    'ItemContainerUpgrade.SocketCountUpgrade': 'Item sockets',
    'MaintenanceUpgrade.EncampedUnitScalingFactorUpgrade': 'Encampment upkeep',
    'MaintenanceUpgrade.MaintenanceFactorUpgrade': 'Maintenance',
    'MaintenanceUpgrade.WorkforceMaintenanceFactorUpgrade': 'Workforce needed',
    'ModuleOwnerUpgrade.ModuleLimitPercent': 'Module limit',
    'MovementUpgrade.BuffBaseSpeedUpgrade': 'Speed',
    'MovementUpgrade.BuffFavorableWindAngle': 'Favourable wind angle',
    'MovementUpgrade.BuffReduceCargoImpactUpgrade': 'Cargo slowdown',
    'MovementUpgrade.BuffReduceDamageImpactUpgrade': 'Damage slowdown',
    'MovementUpgrade.BuffReduceNegativeWindImpactUpgrade': 'Headwind slowdown',
    'MovementUpgrade.BuffTransferSpeedUpgrade': 'Cargo transfer speed',
    'RaceTrackUpgrades.TrainingChargesUpgrade': 'Training charges',
    'RecruitmentUpgrade.ConstructionCostInPercent': 'Construction cost',
    'RecruitmentUpgrade.ConstructionSpeedInPercent': 'Construction speed',
    'RecruitmentUpgrade.RecruitmentCostInPercent': 'Recruitment cost',
    'RecruitmentUpgrade.RecruitmentSpeedInPercent': 'Recruitment speed',
    'RepairCraneUpgrade.HealBuildingsPerMinuteUpgrade':
      'Building repair per minute',
    'RepairCraneUpgrade.HealPerMinuteUpgrade': 'Ship repair per minute',
    'RepairCraneUpgrade.HealRadiusUpgrade': 'Repair radius',
    'RepairCraneUpgrade.MaximumRepairTargetsUpgrade': 'Repair targets',
    'ResidenceUpgrade.ConsumptionModifierInPercent': 'Consumption',
    'ResidenceUpgrade.GoodConsumptionUpgrade.AmountInPercent': 'Consumption',
    'TradeShipUpgrade.ActiveTradePriceInPercent': 'Trade price',
    'TradeShipUpgrade.LoadingSpeedUpgrade': 'Loading speed',
    'UnitUpgrade.AccuracyArcherModuleUpgrade': 'Archer accuracy',
    'UnitUpgrade.AccuracyBallistaModuleUpgrage': 'Ballista accuracy',
    'UnitUpgrade.AccuracyCatapultModuleUpgrage': 'Catapult accuracy',
    'UnitUpgrade.AccuracyUpgrade': 'Accuracy',
    'UnitUpgrade.ArmorUpgrade': 'Armour',
    'UnitUpgrade.AttackCone_BallistaModule': 'Ballista attack cone',
    'UnitUpgrade.AttackCone_CatapultModule': 'Catapult attack cone',
    'UnitUpgrade.AttackSpeedArcherModulePercentualUpgrade':
      'Archer attack speed',
    'UnitUpgrade.AttackSpeedBallistaModulePercentualUpgrade':
      'Ballista attack speed',
    'UnitUpgrade.AttackSpeedCatapultModulePercentualUpgrade':
      'Catapult attack speed',
    'UnitUpgrade.AttackSpeedRangedPercentualUpgrade': 'Ranged attack speed',
    'UnitUpgrade.AttackSpeedTorchPercentualUpgrade': 'Torch attack speed',
    'UnitUpgrade.DefenseUpgrade': 'Defence',
    'UnitUpgrade.DiscoveryRadiusUpgrade': 'Discovery radius',
    'UnitUpgrade.DistanceAttackRangeArcherModulePercentualUpgrade':
      'Archer range',
    'UnitUpgrade.DistanceAttackRangeBallistaModulePercentualUpgrade':
      'Ballista range',
    'UnitUpgrade.DistanceAttackRangeCatapultModulePercentualUpgrade':
      'Catapult range',
    'UnitUpgrade.DistanceAttackRangePercentualUpgrade': 'Attack range',
    'UnitUpgrade.MaximumMoraleUpgrade': 'Maximum morale',
    'UnitUpgrade.OffenseArcherModuleRangedUpgrade': 'Archer damage',
    'UnitUpgrade.OffenseBallistaModuleRangedUpgrade': 'Ballista damage',
    'UnitUpgrade.OffenseCatapultModuleRangedUpgrade': 'Catapult damage',
    'UnitUpgrade.OffenseChargeUpgrade': 'Charge damage',
    'UnitUpgrade.OffenseMeleeUpgrade': 'Melee damage',
    'UnitUpgrade.OffenseRangedUpgrade': 'Ranged damage',
    'UnitUpgrade.RewardMoneyPerDestroyedShipUpgrade':
      'Reward per destroyed ship',
    'UnitUpgrade.ShieldUpgrade': 'Shield',
    'WarehouseUpgrade.AdditionalLoadingSpeedInPercent': 'Loading speed',
  },
}

/** Attribute name when the modifier targets one, else the labelled path; unknown paths fall back to the raw path. */
export function modifierName(
  path: string | null,
  attribute: Attribute | null,
  lang: Lang,
) {
  return (
    attributeName(attribute, lang) ??
    (path ? (modifierNames[lang][path] ?? path) : null)
  )
}
