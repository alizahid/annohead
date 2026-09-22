import { type Attribute, type Lang } from '../enums'
import { attributeName } from './attribute-labels'

/** Display names of `buff_modifier.path` values that are not population attributes. */
const modifierNames: Record<Lang, Record<string, string>> = {
  de: {
    'AqueductUpgrade.AqueductConsumedWaterUpgrade': 'Wasserverbrauch',
    'AqueductUpgrade.AqueductWaterSupplyUpgrade': 'Wasserversorgung',
    'CityInstitutionUpgrade.ResolverRepairDurationUpgrade': 'Reparaturdauer',
    'CityInstitutionUpgrade.ResolverResolveDurationUpgrade': 'Einsatzdauer',
    'CityInstitutionUpgrade.ResolverUnitCountUpgrade': 'Einsatzeinheiten',
    'FactoryUpgrade.NeededAreaUpgrade': 'Benötigte Fläche',
    'FactoryUpgrade.ProductivityUpgrade': 'Produktivität',
    'HealthUpgrade.BaseHealthUpgrade': 'Trefferpunkte',
    'HealthUpgrade.SelfHealUpgrade': 'Selbstreparatur',
    'MaintenanceUpgrade.MaintenanceFactorUpgrade': 'Unterhalt',
    'MaintenanceUpgrade.WorkforceMaintenanceFactorUpgrade':
      'Benötigte Arbeitskraft',
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
    'RepairCraneUpgrade.HealBuildingsPerMinuteUpgrade':
      'Gebäudereparatur pro Minute',
    'RepairCraneUpgrade.HealPerMinuteUpgrade': 'Schiffsreparatur pro Minute',
    'RepairCraneUpgrade.HealRadiusUpgrade': 'Reparaturradius',
    'RepairCraneUpgrade.MaximumRepairTargetsUpgrade': 'Reparaturziele',
    'TradeShipUpgrade.LoadingSpeedUpgrade': 'Ladegeschwindigkeit',
    'UnitUpgrade.AccuracyArcherModuleUpgrade': 'Genauigkeit der Bogenschützen',
    'UnitUpgrade.AccuracyBallistaModuleUpgrage': 'Genauigkeit der Ballisten',
    'UnitUpgrade.AccuracyCatapultModuleUpgrage': 'Genauigkeit der Katapulte',
    'UnitUpgrade.AccuracyUpgrade': 'Genauigkeit',
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
    'UnitUpgrade.DiscoveryRadiusUpgrade': 'Sichtweite',
    'UnitUpgrade.DistanceAttackRangeArcherModulePercentualUpgrade':
      'Reichweite der Bogenschützen',
    'UnitUpgrade.DistanceAttackRangeBallistaModulePercentualUpgrade':
      'Reichweite der Ballisten',
    'UnitUpgrade.DistanceAttackRangeCatapultModulePercentualUpgrade':
      'Reichweite der Katapulte',
    'UnitUpgrade.DistanceAttackRangePercentualUpgrade': 'Angriffsreichweite',
    'UnitUpgrade.OffenseArcherModuleRangedUpgrade': 'Schaden der Bogenschützen',
    'UnitUpgrade.OffenseBallistaModuleRangedUpgrade': 'Schaden der Ballisten',
    'UnitUpgrade.OffenseCatapultModuleRangedUpgrade': 'Schaden der Katapulte',
    'UnitUpgrade.OffenseRangedUpgrade': 'Fernkampfschaden',
    'UnitUpgrade.RewardMoneyPerDestroyedShipUpgrade':
      'Belohnung pro versenktem Schiff',
  },
  en: {
    'AqueductUpgrade.AqueductConsumedWaterUpgrade': 'Water consumption',
    'AqueductUpgrade.AqueductWaterSupplyUpgrade': 'Water supply',
    'CityInstitutionUpgrade.ResolverRepairDurationUpgrade': 'Repair time',
    'CityInstitutionUpgrade.ResolverResolveDurationUpgrade':
      'Incident resolution time',
    'CityInstitutionUpgrade.ResolverUnitCountUpgrade': 'Service units',
    'FactoryUpgrade.NeededAreaUpgrade': 'Required area',
    'FactoryUpgrade.ProductivityUpgrade': 'Productivity',
    'HealthUpgrade.BaseHealthUpgrade': 'Hit points',
    'HealthUpgrade.SelfHealUpgrade': 'Self-repair',
    'MaintenanceUpgrade.MaintenanceFactorUpgrade': 'Maintenance',
    'MaintenanceUpgrade.WorkforceMaintenanceFactorUpgrade': 'Workforce needed',
    'MovementUpgrade.BuffBaseSpeedUpgrade': 'Speed',
    'MovementUpgrade.BuffFavorableWindAngle': 'Favourable wind angle',
    'MovementUpgrade.BuffReduceCargoImpactUpgrade': 'Cargo slowdown',
    'MovementUpgrade.BuffReduceDamageImpactUpgrade': 'Damage slowdown',
    'MovementUpgrade.BuffReduceNegativeWindImpactUpgrade': 'Headwind slowdown',
    'MovementUpgrade.BuffTransferSpeedUpgrade': 'Cargo transfer speed',
    'RaceTrackUpgrades.TrainingChargesUpgrade': 'Training charges',
    'RepairCraneUpgrade.HealBuildingsPerMinuteUpgrade':
      'Building repair per minute',
    'RepairCraneUpgrade.HealPerMinuteUpgrade': 'Ship repair per minute',
    'RepairCraneUpgrade.HealRadiusUpgrade': 'Repair radius',
    'RepairCraneUpgrade.MaximumRepairTargetsUpgrade': 'Repair targets',
    'TradeShipUpgrade.LoadingSpeedUpgrade': 'Loading speed',
    'UnitUpgrade.AccuracyArcherModuleUpgrade': 'Archer accuracy',
    'UnitUpgrade.AccuracyBallistaModuleUpgrage': 'Ballista accuracy',
    'UnitUpgrade.AccuracyCatapultModuleUpgrage': 'Catapult accuracy',
    'UnitUpgrade.AccuracyUpgrade': 'Accuracy',
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
    'UnitUpgrade.DiscoveryRadiusUpgrade': 'Discovery radius',
    'UnitUpgrade.DistanceAttackRangeArcherModulePercentualUpgrade':
      'Archer range',
    'UnitUpgrade.DistanceAttackRangeBallistaModulePercentualUpgrade':
      'Ballista range',
    'UnitUpgrade.DistanceAttackRangeCatapultModulePercentualUpgrade':
      'Catapult range',
    'UnitUpgrade.DistanceAttackRangePercentualUpgrade': 'Attack range',
    'UnitUpgrade.OffenseArcherModuleRangedUpgrade': 'Archer damage',
    'UnitUpgrade.OffenseBallistaModuleRangedUpgrade': 'Ballista damage',
    'UnitUpgrade.OffenseCatapultModuleRangedUpgrade': 'Catapult damage',
    'UnitUpgrade.OffenseRangedUpgrade': 'Ranged damage',
    'UnitUpgrade.RewardMoneyPerDestroyedShipUpgrade':
      'Reward per destroyed ship',
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
