export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  default_color: string;
  email?: string | null;
  website?: string | null;
  created_at: string;
}

export type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor' | 'na';
export type ReportStatus = 'draft' | 'completed';
export type ReportType = 'VIN' | 'Plate';
export type PackageType = 'Basic' | 'Standard' | 'Premium';
export type EquipmentStatus = 'Equipped' | 'Not Equipped' | 'Not Verified';
export type VerificationFlag = boolean | null;

export interface LegalCheck {
  label: string;
  status: string;
}

export interface SafetyFeatureItem {
  label: string;
  status: 'Equipped' | 'Not Equipped';
}

export interface TitleCheckItem {
  label: string;
  value: boolean;
}

export type AustralianFields = Record<string, string>;
export type AustralianRecord = Record<string, string>;

export interface AustralianReportData {
  registration: AustralianFields;
  ppsr: AustralianFields;
  damageHistory: AustralianFields;
  odometer: AustralianFields;
  mechanical: AustralianFields;
  engineAssessment: AustralianFields;
  diagnostics: AustralianFields;
  exterior: AustralianFields;
  interior: AustralianFields;
  safety: AustralianFields;
  recalls: AustralianFields;
  valuation: AustralianFields;
  fuelEnvironment: AustralianFields;
  ownership: AustralianFields;
  reliability: AustralianFields;
  serviceHistory: AustralianFields;
  overallHealth: AustralianFields;
  dataSources: AustralianFields;
  tyres: Record<'Front Left' | 'Front Right' | 'Rear Left' | 'Rear Right' | 'Spare', AustralianFields> & { general: AustralianFields };
  accidentRecords: AustralianRecord[];
  damageRecords: AustralianRecord[];
  odometerHistory: AustralianRecord[];
  diagnosticFaultCodes: AustralianRecord[];
  recallRecords: AustralianRecord[];
  serviceRecords: AustralianRecord[];
  repairRecommendations: AustralianRecord[];
}

export interface ReportData {
  // Header/summary stats
  searchDate: string;
  accidentsCount: number | null;
  recallsCount: number | null;
  titleRecordsCount: number | null;
  junkSalvageCount: number | null;
  totalLossCount: number | null;
  problemChecksCount: number | null;

  // Executive Summary fields
  vehicleDisplay: string;
  plateNumber: string;
  currentMileage: string;
  titleRecordsStatus: string;
  accidentsStatus: string;
  junkSalvageStatus: string;
  totalLossStatus: string;
  problemChecksStatus: string;
  recallsStatus: string;
  greatNewsMessage: string;

  // Legal Checks
  financialLegalStatus: string;
  insuranceWriteoffStatus: string;
  accidentRecordsStatus: string;
  theftStolenStatus: string;

  // Core Vehicle Specifications
  colour: string;
  engine: string;
  maxTorque: string;
  topSpeed: string;
  gearbox: string;
  marketValue: string;
  lastReportedMileage: string;
  estimatedMileage: string;

  // General Status
  vehicleClass: string;
  consumptionCity: string;
  wheelPlan: string;

  // Engine & Transmission
  cylinders: string;
  camType: string;
  fuelInduction: string;
  fuelType: string;
  valves: string;
  maxHorsepower: string;
  totalMaxTorque: string;
  transmissionEngine: string;

  // Fuel Efficiency
  fuelGrade: string;
  cityEconomy: string;
  highwayEconomy: string;
  combinedEconomy: string;

  // Title Brand & Problem Checks
  // Damage & Salvage
  floodDamage: VerificationFlag;
  fireDamage: VerificationFlag;
  hailDamage: VerificationFlag;
  junkTitle: VerificationFlag;
  totaled: VerificationFlag;
  salvage: VerificationFlag;
  formerRental: VerificationFlag;

  // Title History
  priorTaxi: VerificationFlag;
  odometerNotActual: VerificationFlag;
  vandalism: VerificationFlag;
  rebuilt: VerificationFlag;
  dismantled: VerificationFlag;
  collision: VerificationFlag;
  priorPolice: VerificationFlag;

  // Warranty & Status
  warrantyReturn: VerificationFlag;
  partsOnly: VerificationFlag;
  recoveredTheft: VerificationFlag;
  undisclosedLien: VerificationFlag;
  antiqueClassic: VerificationFlag;
  agriculturalVehicle: VerificationFlag;
  reissuedVIN: VerificationFlag;

  // Safety & Defect
  manufacturerBuyBack: VerificationFlag;
  salvageStolen: VerificationFlag;
  crushed: VerificationFlag;
  inoperableVehicle: VerificationFlag;
  hazardous: VerificationFlag;
  exportOnlyVehicle: VerificationFlag;
  odometerTampering: VerificationFlag;
  grayMarket: VerificationFlag;

  // Odometer & Discrepancy
  odometerExceedsLimits: VerificationFlag;
  odometerAltered: VerificationFlag;
  odometerReplaced: VerificationFlag;
  odometerDiscrepancy: VerificationFlag;
  pendingJunk: VerificationFlag;
  junkAutomobile: VerificationFlag;

  // Recalls
  recallsMessage: string;

  // Safety Features
  frontAirbags: EquipmentStatus;
  sideAirbags: EquipmentStatus;
  sideCurtainAirbags: EquipmentStatus;
  abs: EquipmentStatus;
  brakingAssist: EquipmentStatus;
  electronicBrakeforceDistribution: EquipmentStatus;
  activeHeadRestraints: EquipmentStatus;
  childSafetyDoorLocks: EquipmentStatus;
  childSeatAnchors: EquipmentStatus;
  crumpleZones: EquipmentStatus;
  emergencyInteriorTrunkRelease: EquipmentStatus;

  // Security Features
  hillHolderControl: EquipmentStatus;
  stabilityControl: EquipmentStatus;
  tractionControl: EquipmentStatus;
  antiTheftSystem: EquipmentStatus;
  powerDoorLocks: EquipmentStatus;
  frontSeatbelts: EquipmentStatus;
  rearSeatbelts: EquipmentStatus;
  seatbeltPretensioners: EquipmentStatus;
  seatbeltWarningSensor: EquipmentStatus;

  // Auditing Summary
  auditSummaryText: string;
  marketValueSummary: string;
  disclaimerText: string;

  // Contact
  email: string;
  website: string;
  tagline: string;
  securedBy: string;
  australian: AustralianReportData;
}

export interface Report {
  id: string;
  user_id: string;
  brand_id: string;
  brand?: Brand;
  report_type: ReportType;
  package_type: PackageType;

  vin_number: string | null;
  plate_number: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;

  brand_color: string;
  logo_url: string | null;

  report_data: ReportData;

  client_name: string | null;
  vehicle_name: string | null;
  overall_score: number | null;
  status: ReportStatus;

  created_at: string;
  updated_at: string;
}
