import type { AustralianFields, AustralianReportData } from '../types';

export interface AustralianSectionConfig {
  title: string;
  group: Exclude<keyof AustralianReportData, 'tyres' | 'accidentRecords' | 'damageRecords' | 'odometerHistory' | 'diagnosticFaultCodes' | 'recallRecords' | 'serviceRecords' | 'repairRecommendations'>;
  fields: Array<{ label: string; key: string; initialValue?: string }>;
}

export const AUSTRALIAN_SECTIONS: AustralianSectionConfig[] = [
  {
    title: 'Australian Registration & Compliance History',
    group: 'registration',
    fields: [
      { label: 'Registration Status', key: 'registrationStatus', initialValue: 'Not Verified' },
      { label: 'Registration State/Territory', key: 'registrationRegion', initialValue: 'Not Available' },
      { label: 'Registration Expiry Date', key: 'registrationExpiryDate', initialValue: 'Not Available' },
      { label: 'Registration Number', key: 'registrationNumber', initialValue: 'Not Available' },
      { label: 'VIN Verification', key: 'vinVerification', initialValue: 'Not Verified' },
      { label: 'Engine Number Verification', key: 'engineNumberVerification', initialValue: 'Not Verified' },
      { label: 'Compliance Plate Details', key: 'compliancePlateDetails', initialValue: 'Not Available' },
      { label: 'Roadworthiness Certificate Status', key: 'roadworthinessCertificateStatus', initialValue: 'Not Verified' },
      { label: 'Previous Registration Details', key: 'previousRegistrationDetails', initialValue: 'Not Available' },
    ],
  },
  {
    title: 'PPSR & Financial Interest Checks',
    group: 'ppsr',
    fields: [
      { label: 'PPSR Search Status', key: 'searchStatus', initialValue: 'Not Verified' },
      { label: 'Search Certificate Number', key: 'certificateNumber', initialValue: 'Not Available' },
      { label: 'Search Date', key: 'searchDate', initialValue: 'Not Available' },
      { label: 'Financial Encumbrance Status', key: 'financialEncumbranceStatus', initialValue: 'Not Verified' },
      { label: 'Outstanding Finance Status', key: 'outstandingFinanceStatus', initialValue: 'Not Verified' },
      { label: 'Written-Off Vehicle Register (WOVR) Status', key: 'wovrStatus', initialValue: 'Not Verified' },
      { label: 'Stolen Vehicle Status', key: 'stolenVehicleStatus', initialValue: 'Not Verified' },
      { label: 'VIN Search Result', key: 'vinSearchResult', initialValue: 'Not Verified' },
      { label: 'PPSR Certificate Reference', key: 'certificateReference', initialValue: 'Not Available' },
    ],
  },
  {
    title: 'Written-Off & Accident History',
    group: 'damageHistory',
    fields: [
      { label: 'Accident Records', key: 'accidentRecordsStatus', initialValue: 'Not Verified' },
      { label: 'Statutory Write-Off Check', key: 'statutoryWriteOffCheck', initialValue: 'Not Verified' },
      { label: 'Repairable Write-Off Check', key: 'repairableWriteOffCheck', initialValue: 'Not Verified' },
      { label: 'Structural Damage History', key: 'structuralDamageHistory', initialValue: 'Not Verified' },
      { label: 'Flood Damage History', key: 'floodDamageHistory', initialValue: 'Not Verified' },
      { label: 'Hail Damage History', key: 'hailDamageHistory', initialValue: 'Not Verified' },
      { label: 'Fire Damage History', key: 'fireDamageHistory', initialValue: 'Not Verified' },
      { label: 'Insurance Claim Records', key: 'insuranceClaimRecords', initialValue: 'Not Verified' },
      { label: 'Previous Damage Description', key: 'previousDamageDescription', initialValue: 'Not Available' },
      { label: 'Damage Record Date', key: 'damageRecordDate', initialValue: 'Not Available' },
    ],
  },
  {
    title: 'Odometer & Mileage Verification',
    group: 'odometer',
    fields: [
      { label: 'Current Odometer Reading', key: 'currentOdometerReading', initialValue: 'Not Available' },
      { label: 'Odometer Reading Date', key: 'odometerReadingDate', initialValue: 'Not Available' },
      { label: 'Odometer Discrepancy Check', key: 'odometerDiscrepancyCheck', initialValue: 'Not Verified' },
      { label: 'Mileage Consistency Status', key: 'mileageConsistencyStatus', initialValue: 'Not Verified' },
      { label: 'Odometer Tampering Warning', key: 'odometerTamperingWarning', initialValue: 'Not Verified' },
    ],
  },
  {
    title: 'Mechanical Inspection Report',
    group: 'mechanical',
    fields: [
      ...['Engine Condition', 'Transmission Condition', 'Brake System', 'Suspension System', 'Steering System', 'Cooling System', 'Exhaust System', 'Battery Condition', 'Alternator', 'Radiator', 'Oil Leakage', 'Coolant Leakage', 'Drive Belt Condition', 'Differential Condition']
        .map((label) => ({ label, key: label.replace(/[^a-zA-Z0-9]/g, ''), initialValue: 'Not Inspected' })),
    ],
  },
  {
    title: 'Engine & Transmission Assessment',
    group: 'engineAssessment',
    fields: [
      ...['Engine Type', 'Engine Capacity', 'Number of Cylinders', 'Fuel Type', 'Transmission Type', 'Gearbox Condition', 'Engine Noise Assessment', 'Engine Performance', 'Transmission Performance', 'Oil Condition', 'Coolant Condition', 'Engine Fault Indicators']
        .map((label) => ({ label, key: label.replace(/[^a-zA-Z0-9]/g, ''), initialValue: 'Not Available' })),
    ],
  },
  {
    title: 'OBD & Diagnostic Scan',
    group: 'diagnostics',
    fields: [
      { label: 'Diagnostic Scan Status', key: 'scanStatus', initialValue: 'Not Verified' },
      { label: 'Scan Date', key: 'scanDate', initialValue: 'Not Available' },
      { label: 'ECU Information', key: 'ecuInformation', initialValue: 'Not Available' },
      { label: 'Engine DTC Codes', key: 'engineDtcCodes', initialValue: 'Not Available' },
      { label: 'Transmission DTC Codes', key: 'transmissionDtcCodes', initialValue: 'Not Available' },
      { label: 'ABS Fault Codes', key: 'absFaultCodes', initialValue: 'Not Available' },
      { label: 'Airbag Fault Codes', key: 'airbagFaultCodes', initialValue: 'Not Available' },
      { label: 'Other Diagnostic Fault Codes', key: 'otherFaultCodes', initialValue: 'Not Available' },
      { label: 'Check Engine Light Status', key: 'checkEngineLightStatus', initialValue: 'Not Verified' },
      { label: 'Diagnostic Notes', key: 'diagnosticNotes', initialValue: 'Not Available' },
    ],
  },
  {
    title: 'Exterior & Body Condition Assessment',
    group: 'exterior',
    fields: [
      ...['Front Bumper', 'Rear Bumper', 'Bonnet', 'Roof', 'Front Left Door', 'Front Right Door', 'Rear Left Door', 'Rear Right Door', 'Boot/Tailgate', 'Windscreen', 'Windows', 'Paint Condition', 'Rust and Corrosion', 'Panel Alignment', 'Headlights and Taillights']
        .map((label) => ({ label, key: label.replace(/[^a-zA-Z0-9]/g, ''), initialValue: 'Not Inspected' })),
    ],
  },
  {
    title: 'Interior Inspection',
    group: 'interior',
    fields: [
      ...['Dashboard Condition', 'Seats Condition', 'Steering Wheel Condition', 'Carpet and Flooring', 'Air Conditioning', 'Heating System', 'Infotainment System', 'Audio System', 'Electric Windows', 'Central Locking', 'Interior Electronics', 'Seatbelt Condition']
        .map((label) => ({ label, key: label.replace(/[^a-zA-Z0-9]/g, ''), initialValue: 'Not Inspected' })),
    ],
  },
  {
    title: 'Safety & Security Assessment',
    group: 'safety',
    fields: [
      { label: 'ANCAP Safety Rating', key: 'ancapSafetyRating', initialValue: 'Not Verified' },
      { label: 'Front Airbags', key: 'frontAirbags', initialValue: 'Not Verified' },
      { label: 'Side Airbags', key: 'sideAirbags', initialValue: 'Not Verified' },
      { label: 'Curtain Airbags', key: 'curtainAirbags', initialValue: 'Not Verified' },
      { label: 'ABS', key: 'abs', initialValue: 'Not Verified' },
      { label: 'Electronic Stability Control', key: 'electronicStabilityControl', initialValue: 'Not Verified' },
      { label: 'Traction Control', key: 'tractionControl', initialValue: 'Not Verified' },
      { label: 'Autonomous Emergency Braking', key: 'autonomousEmergencyBraking', initialValue: 'Not Verified' },
      { label: 'Lane Departure Warning', key: 'laneDepartureWarning', initialValue: 'Not Verified' },
      { label: 'Blind Spot Monitoring', key: 'blindSpotMonitoring', initialValue: 'Not Verified' },
      { label: 'Rear View Camera', key: 'rearViewCamera', initialValue: 'Not Verified' },
      { label: 'Parking Sensors', key: 'parkingSensors', initialValue: 'Not Verified' },
      { label: 'Immobiliser', key: 'immobiliser', initialValue: 'Not Verified' },
      { label: 'Alarm System', key: 'alarmSystem', initialValue: 'Not Verified' },
    ],
  },
  {
    title: 'Manufacturer Recall History',
    group: 'recalls',
    fields: [
      { label: 'Recall Status', key: 'recallStatus', initialValue: 'Not Verified' },
    ],
  },
  {
    title: 'Vehicle Market Value & Depreciation',
    group: 'valuation',
    fields: [
      { label: 'Estimated Market Value (AUD)', key: 'estimatedMarketValue', initialValue: 'Not Available' },
      { label: 'Private Sale Value (AUD)', key: 'privateSaleValue', initialValue: 'Not Available' },
      { label: 'Dealer Trade-In Value (AUD)', key: 'dealerTradeInValue', initialValue: 'Not Available' },
      { label: 'Estimated Wholesale Value (AUD)', key: 'estimatedWholesaleValue', initialValue: 'Not Available' },
      { label: 'Original Purchase Price', key: 'originalPurchasePrice', initialValue: 'Not Available' },
      { label: 'Estimated Depreciation', key: 'estimatedDepreciation', initialValue: 'Not Available' },
      { label: 'Valuation Date', key: 'valuationDate', initialValue: 'Not Available' },
      { label: 'Valuation Source', key: 'valuationSource', initialValue: 'Not Available' },
      { label: 'Market Value Notes', key: 'marketValueNotes', initialValue: 'Not Available' },
    ],
  },
  {
    title: 'Fuel Economy & Environmental Information',
    group: 'fuelEnvironment',
    fields: [
      { label: 'Fuel Type', key: 'fuelType', initialValue: 'Not Available' },
      { label: 'Combined Fuel Consumption (L/100km)', key: 'combinedFuelConsumption', initialValue: 'Not Available' },
      { label: 'Urban Fuel Consumption', key: 'urbanFuelConsumption', initialValue: 'Not Available' },
      { label: 'Extra Urban Fuel Consumption', key: 'extraUrbanFuelConsumption', initialValue: 'Not Available' },
      { label: 'CO₂ Emissions (g/km)', key: 'co2Emissions', initialValue: 'Not Available' },
      { label: 'Emissions Standard', key: 'emissionsStandard', initialValue: 'Not Available' },
      { label: 'Fuel Tank Capacity', key: 'fuelTankCapacity', initialValue: 'Not Available' },
      { label: 'Driving Range Estimate', key: 'drivingRangeEstimate', initialValue: 'Not Available' },
    ],
  },
  {
    title: 'Vehicle Ownership & Usage History',
    group: 'ownership',
    fields: [
      { label: 'Available Previous Ownership Records', key: 'previousOwnershipRecords', initialValue: 'Not Available' },
      { label: 'Ownership Change Dates', key: 'ownershipChangeDates', initialValue: 'Not Available' },
      { label: 'Previous Vehicle Use', key: 'previousVehicleUse', initialValue: 'Not Available' },
      { label: 'Private / Commercial Use', key: 'privateCommercialUse', initialValue: 'Not Available' },
      { label: 'Fleet Vehicle Status', key: 'fleetVehicleStatus', initialValue: 'Not Verified' },
      { label: 'Taxi / Rental Use', key: 'taxiRentalUse', initialValue: 'Not Verified' },
      { label: 'Import Status', key: 'importStatus', initialValue: 'Not Verified' },
      { label: 'Import Compliance Details', key: 'importComplianceDetails', initialValue: 'Not Available' },
    ],
  },
  {
    title: 'Service & Maintenance History',
    group: 'serviceHistory',
    fields: [
      { label: 'Service History Status', key: 'serviceHistoryStatus', initialValue: 'Not Verified' },
    ],
  },
  {
    title: 'Common Problems & Reliability',
    group: 'reliability',
    fields: [
      { label: 'Known Model-Specific Issues (general information; not confirmed vehicle faults)', key: 'knownModelIssues', initialValue: 'Not Available' },
      { label: 'Engine Reliability', key: 'engineReliability', initialValue: 'Not Assessed' },
      { label: 'Transmission Reliability', key: 'transmissionReliability', initialValue: 'Not Assessed' },
      { label: 'Common Mechanical Faults (general information; not confirmed vehicle faults)', key: 'commonMechanicalFaults', initialValue: 'Not Available' },
      { label: 'Manufacturer Technical Advisories', key: 'technicalAdvisories', initialValue: 'Not Available' },
      { label: 'Maintenance Concerns', key: 'maintenanceConcerns', initialValue: 'Not Available' },
      { label: 'Reliability Assessment', key: 'reliabilityAssessment', initialValue: 'Not Assessed' },
    ],
  },
  {
    title: 'Overall Vehicle Health Assessment',
    group: 'overallHealth',
    fields: [
      { label: 'Overall Vehicle Health Score (0–100)', key: 'healthScore', initialValue: 'Not Assessed' },
      { label: 'Mechanical Condition Rating', key: 'mechanicalRating', initialValue: 'Not Assessed' },
      { label: 'Exterior Condition Rating', key: 'exteriorRating', initialValue: 'Not Assessed' },
      { label: 'Interior Condition Rating', key: 'interiorRating', initialValue: 'Not Assessed' },
      { label: 'Safety Rating', key: 'safetyRating', initialValue: 'Not Assessed' },
      { label: 'History Risk Assessment', key: 'historyRiskAssessment', initialValue: 'Not Assessed' },
      { label: 'Financial Risk Assessment', key: 'financialRiskAssessment', initialValue: 'Not Assessed' },
      { label: 'Major Issues Identified', key: 'majorIssuesIdentified', initialValue: 'Not Available' },
      { label: 'Recommended Actions', key: 'recommendedActions', initialValue: 'Not Available' },
      { label: 'Final Vehicle Assessment', key: 'finalVehicleAssessment', initialValue: 'Not Assessed' },
    ],
  },
  {
    title: 'Data Sources, Verification & Disclaimer',
    group: 'dataSources',
    fields: [
      { label: 'PPSR Data Source', key: 'ppsrDataSource', initialValue: 'Not Available' },
      { label: 'Registration Verification Source', key: 'registrationVerificationSource', initialValue: 'Not Available' },
      { label: 'Written-Off Register Source', key: 'writtenOffRegisterSource', initialValue: 'Not Available' },
      { label: 'Recall Data Source', key: 'recallDataSource', initialValue: 'Not Available' },
      { label: 'ANCAP Data Source', key: 'ancapDataSource', initialValue: 'Not Available' },
      { label: 'Vehicle Specification Source', key: 'vehicleSpecificationSource', initialValue: 'Not Available' },
      { label: 'Data Retrieval Date', key: 'dataRetrievalDate', initialValue: 'Not Available' },
      { label: 'Report Generation Date', key: 'reportGenerationDate', initialValue: 'Not Available' },
      { label: 'Report Reference Number', key: 'reportReferenceNumber', initialValue: 'Not Available' },
      { label: 'Data Limitations', key: 'dataLimitations', initialValue: 'Not Available' },
      { label: 'Important Disclaimer', key: 'importantDisclaimer', initialValue: 'Database searches and vehicle history checks are not a substitute for an independent physical mechanical inspection. Verify all vehicle details and records with the relevant authorities and a qualified Australian automotive professional before purchase.' },
    ],
  },
];

export const AUSTRALIAN_RECORD_FIELDS = {
  accidentRecords: [
    ['Record Date', 'date'],
    ['Accident Description', 'description'],
    ['Source / Reference', 'source'],
  ],
  damageRecords: [
    ['Damage Record Date', 'date'],
    ['Damage Type', 'type'],
    ['Damage Description', 'description'],
    ['Source / Reference', 'source'],
  ],
  odometerHistory: [
    ['Reading Date', 'date'],
    ['Odometer Reading (km)', 'reading'],
    ['Source / Reference', 'source'],
  ],
  diagnosticFaultCodes: [
    ['Code', 'code'],
    ['Description', 'description'],
    ['Severity', 'severity'],
    ['System', 'system'],
  ],
  recallRecords: [
    ['Campaign Number', 'campaignNumber'],
    ['Recall Description', 'description'],
    ['Announcement Date', 'announcementDate'],
    ['Affected Component', 'affectedComponent'],
    ['Remedy Status', 'remedyStatus'],
    ['Recall Completion Status', 'completionStatus'],
  ],
  serviceRecords: [
    ['Service Date', 'date'],
    ['Odometer Reading (km)', 'odometerReading'],
    ['Service Provider', 'provider'],
    ['Service Type', 'type'],
    ['Maintenance Description', 'description'],
    ['Parts Replaced', 'partsReplaced'],
    ['Repair Details', 'repairDetails'],
    ['Service Record Reference', 'reference'],
  ],
  repairRecommendations: [
    ['Identified Issue', 'issue'],
    ['Recommended Action', 'action'],
    ['Priority (Immediate / High / Medium / Low)', 'priority'],
    ['Estimated Repair Cost (AUD)', 'estimatedCost'],
    ['Recommended Maintenance Timeline', 'timeline'],
    ['Additional Notes', 'notes'],
  ],
} as const;

const recordGroupKeys = [
  'accidentRecords',
  'damageRecords',
  'odometerHistory',
  'diagnosticFaultCodes',
  'recallRecords',
  'serviceRecords',
  'repairRecommendations',
] as const;

const fieldGroupKeys = [
  'registration',
  'ppsr',
  'damageHistory',
  'odometer',
  'mechanical',
  'engineAssessment',
  'diagnostics',
  'exterior',
  'interior',
  'safety',
  'recalls',
  'valuation',
  'fuelEnvironment',
  'ownership',
  'reliability',
  'serviceHistory',
  'overallHealth',
  'dataSources',
] as const;

export function createDefaultAustralianReportData(): AustralianReportData {
  const groups = Object.fromEntries(
    AUSTRALIAN_SECTIONS.map(({ group, fields }) => [
      group,
      Object.fromEntries(fields.map(({ key, initialValue }) => [key, initialValue ?? 'Not Available'])),
    ]),
  ) as Record<(typeof fieldGroupKeys)[number], AustralianFields>;

  const emptyRecords = Object.fromEntries(recordGroupKeys.map((key) => [key, []]));

  const tyreFields = ['Tread Depth (mm)', 'Tyre Condition', 'Tyre Brand', 'Tyre Size', 'Manufacturing Date']
    .map((label) => [label.replace(/[^a-zA-Z0-9]/g, ''), label === 'Tyre Condition' ? 'Not Inspected' : 'Not Available']);
  const tyres = Object.fromEntries(
    (['Front Left', 'Front Right', 'Rear Left', 'Rear Right', 'Spare'] as const)
      .map((position) => [position, Object.fromEntries(tyreFields)]),
  ) as AustralianReportData['tyres'];
  tyres.general = Object.fromEntries(
    ['Wheel Condition', 'Brake Pads', 'Brake Discs', 'Brake Fluid', 'ABS System', 'Wheel Alignment']
      .map((label) => [label.replace(/[^a-zA-Z0-9]/g, ''), 'Not Inspected']),
  );

  return { ...groups, ...emptyRecords, tyres } as AustralianReportData;
}

export function mergeAustralianReportData(
  defaults: AustralianReportData,
  saved?: Partial<AustralianReportData>,
): AustralianReportData {
  if (!saved) return defaults;

  return {
    ...defaults,
    ...saved,
    ...Object.fromEntries(fieldGroupKeys.map((key) => [key, { ...defaults[key], ...saved[key] }])),
    tyres: {
      ...defaults.tyres,
      ...saved.tyres,
      ...Object.fromEntries(
        Object.keys(defaults.tyres).map((position) => [
          position,
          { ...defaults.tyres[position as keyof typeof defaults.tyres], ...saved.tyres?.[position as keyof typeof defaults.tyres] },
        ]),
      ),
    },
  };
}
