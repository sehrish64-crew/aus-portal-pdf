import type { ReportData } from '../types';
import { createDefaultAustralianReportData } from './australianReport';

export function createDefaultReportData(make?: string, model?: string, year?: number, mileage?: number, plate?: string, vin?: string): ReportData {
  const vehicleDisplay = [year, make, model].filter(Boolean).join(' ') || 'Unknown Vehicle';
  const currentMileage = mileage ? `${mileage.toLocaleString()} km` : 'Not Available';
  const today = new Date().toLocaleDateString('en-AU');

  return {
    searchDate: today,
    accidentsCount: 0,
    recallsCount: 0,
    titleRecordsCount: 0,
    junkSalvageCount: 0,
    totalLossCount: 0,
    problemChecksCount: 0,

    vehicleDisplay,
    plateNumber: plate || vin || '---',
    currentMileage,
    titleRecordsStatus: 'Not Verified',
    accidentsStatus: 'Not Verified',
    junkSalvageStatus: 'Not Verified',
    totalLossStatus: 'Not Verified',
    problemChecksStatus: 'Not Verified',
    recallsStatus: 'Not Verified',
    greatNewsMessage: 'Vehicle history results have not been verified. Add sourced findings before drawing conclusions.',

    financialLegalStatus: 'Not Verified',
    insuranceWriteoffStatus: 'Not Verified',
    accidentRecordsStatus: 'Not Verified',
    theftStolenStatus: 'Not Verified',

    colour: '---',
    engine: '---',
    maxTorque: '---',
    topSpeed: '---',
    gearbox: '---',
    marketValue: '---',
    lastReportedMileage: currentMileage,
    estimatedMileage: '---',

    vehicleClass: '---',
    consumptionCity: '---',
    wheelPlan: '---',

    cylinders: '---',
    camType: '---',
    fuelInduction: '---',
    fuelType: '---',
    valves: '---',
    maxHorsepower: '---',
    totalMaxTorque: '---',
    transmissionEngine: '---',

    fuelGrade: '---',
    cityEconomy: '---',
    highwayEconomy: '---',
    combinedEconomy: '---',

    floodDamage: null,
    fireDamage: null,
    hailDamage: null,
    junkTitle: null,
    totaled: null,
    salvage: null,
    formerRental: null,

    priorTaxi: null,
    odometerNotActual: null,
    vandalism: null,
    rebuilt: null,
    dismantled: null,
    collision: null,
    priorPolice: null,

    warrantyReturn: null,
    partsOnly: null,
    recoveredTheft: null,
    undisclosedLien: null,
    antiqueClassic: null,
    agriculturalVehicle: null,
    reissuedVIN: null,

    manufacturerBuyBack: null,
    salvageStolen: null,
    crushed: null,
    inoperableVehicle: null,
    hazardous: null,
    exportOnlyVehicle: null,
    odometerTampering: null,
    grayMarket: null,

    odometerExceedsLimits: null,
    odometerAltered: null,
    odometerReplaced: null,
    odometerDiscrepancy: null,
    pendingJunk: null,
    junkAutomobile: null,

    recallsMessage: 'Recall status has not been verified for this vehicle.',

    frontAirbags: 'Not Verified',
    sideAirbags: 'Not Verified',
    sideCurtainAirbags: 'Not Verified',
    abs: 'Not Verified',
    brakingAssist: 'Not Verified',
    electronicBrakeforceDistribution: 'Not Verified',
    activeHeadRestraints: 'Not Verified',
    childSafetyDoorLocks: 'Not Verified',
    childSeatAnchors: 'Not Verified',
    crumpleZones: 'Not Verified',
    emergencyInteriorTrunkRelease: 'Not Verified',

    hillHolderControl: 'Not Verified',
    stabilityControl: 'Not Verified',
    tractionControl: 'Not Verified',
    antiTheftSystem: 'Not Verified',
    powerDoorLocks: 'Not Verified',
    frontSeatbelts: 'Not Verified',
    rearSeatbelts: 'Not Verified',
    seatbeltPretensioners: 'Not Verified',
    seatbeltWarningSensor: 'Not Verified',

    auditSummaryText: `Vehicle information and inspection findings for ${vehicleDisplay} are recorded in the sections below. Items marked Not Available, Not Verified or Not Inspected require further checking.`,
    marketValueSummary: 'Market value (AUD): Not Available.',
    disclaimerText: 'Database searches and vehicle history checks are not a substitute for an independent physical mechanical inspection. Verify vehicle details and records with the relevant Australian authorities and a qualified automotive professional before purchase.',

    email: 'info@example.com',
    website: 'https://example.com/',
    tagline: 'One VIN. Complete History.',
    securedBy: 'Secured by Brand',
    australian: createDefaultAustralianReportData(),
  };
}
