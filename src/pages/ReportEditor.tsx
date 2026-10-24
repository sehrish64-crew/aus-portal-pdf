import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createDefaultReportData } from '../lib/defaultReportData';
import { getLocalReport, saveLocalReport } from '../lib/localReports';
import {
  Save, Download, ArrowLeft, CheckCircle, Plus, Trash2, FileText,
  AlertTriangle, RotateCcw, Tag, TrendingDown, AlertCircle, Car,
  ShieldCheck, Lock, Gauge, Cog, ClipboardList, Scale,
  Calendar, Info, CheckSquare, Fuel, Wrench,
} from 'lucide-react';
import type { AustralianRecord, AustralianReportData, Report, ReportData } from '../types';
import { AUSTRALIAN_RECORD_FIELDS, AUSTRALIAN_SECTIONS, mergeAustralianReportData } from '../lib/australianReport';

type BooleanReportDataKey = {
  [Key in keyof ReportData]: ReportData[Key] extends boolean | null ? Key : never;
}[keyof ReportData];
type EquipmentReportDataKey = {
  [Key in keyof ReportData]: ReportData[Key] extends 'Equipped' | 'Not Equipped' | 'Not Verified' ? Key : never;
}[keyof ReportData];
type AustralianFieldGroup = keyof Pick<AustralianReportData,
  'registration' | 'ppsr' | 'damageHistory' | 'odometer' | 'mechanical' | 'engineAssessment' |
  'diagnostics' | 'exterior' | 'interior' | 'safety' | 'recalls' | 'valuation' | 'fuelEnvironment' |
  'ownership' | 'reliability' | 'serviceHistory' | 'overallHealth' | 'dataSources'>;
type AustralianRecordGroup = keyof Pick<AustralianReportData,
  'accidentRecords' | 'damageRecords' | 'odometerHistory' | 'diagnosticFaultCodes' |
  'recallRecords' | 'serviceRecords' | 'repairRecommendations'>;
type TyrePosition = keyof AustralianReportData['tyres'];
type StandardReportField = { label: string; value: string; onChange: (value: string) => void };

// ─── Inline Editable Text ────────────────────────────────────────────────────
function E({
  value, onChange, className = '', multiline = false, style,
}: {
  value: string | number | boolean; onChange: (v: string) => void;
  className?: string; multiline?: boolean; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const textValue = String(value ?? '');
  useEffect(() => { if (ref.current && !focused) ref.current.textContent = textValue; }, [textValue, focused]);
  return (
    <span ref={ref} contentEditable
      onFocus={() => setFocused(true)}
      onBlur={(e) => { setFocused(false); onChange(e.currentTarget.textContent || ''); }}
      onKeyDown={(e) => { if (!multiline && e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).blur(); } }}
      className={`outline-none ${className}`}
      style={{ minWidth: 20, display: 'inline-block', cursor: 'text', borderRadius: 3, ...style }}
    />
  );
}


// ─── FIXED: Equipped Toggle ─────────────────────────────────────────────────
// ─── FIXED: Equipped Toggle ─────────────────────────────────────────────────
function EToggle({ value, onChange, color }: { value: 'Equipped' | 'Not Equipped' | 'Not Verified'; onChange: (v: 'Equipped' | 'Not Equipped' | 'Not Verified') => void; color: string }) {
  const eq = value === 'Equipped';
  const statusColor = eq ? color : value === 'Not Equipped' ? '#64748b' : '#b45309';
  const nextStatus = value === 'Not Verified' ? 'Equipped' : value === 'Equipped' ? 'Not Equipped' : 'Not Verified';
  return (
    <button className="report-editor-print-toggle" onClick={() => onChange(nextStatus)}
      style={{
        backgroundColor: eq ? color + '18' : value === 'Not Verified' ? '#fffbeb' : '#f8fafc',
        color: statusColor,
        border: `1.5px solid ${eq ? color + '50' : value === 'Not Verified' ? '#fde68a' : '#e2e8f0'}`,
        padding: '4px 4px',
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        // CRITICAL: Text centering for PDF
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: 'normal',
        minWidth: '70px',
        height: '15px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        // Prevent text wrapping
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
      }}>
      {value}
    </button>
  );
}
// ─── Yes/No Toggle ───────────────────────────────────────────────────────────
function EBool({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div onClick={() => onChange(value === null ? true : value ? false : null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${value === null ? '#fde68a' : '#e2e8f0'}`, background: 'white', cursor: 'pointer', gap: 8, userSelect: 'none' }}>
      <span style={{ fontSize: 11, color: '#7a7a7a', lineHeight: 1.3 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: value === null ? '#b45309' : value ? '#ef4444' : '#16a34a', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
        {value === null ? 'Not Verified' : value
          ? <><svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" /></svg> Yes</>
          : <><svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5L8.5 2" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> No</>
        }
      </span>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, onChange }: { status: string; onChange: (v: string) => void }) {
  const normalized = status.toLowerCase();
  const ok = normalized.includes('no records') || normalized === 'clear';
  const unverified = normalized.includes('not verified') || normalized.includes('not assessed') || normalized.includes('not available');
  const color = ok ? '#15803d' : unverified ? '#b45309' : '#dc2626';
  const nextStatus = unverified ? 'Clear' : ok ? 'Records Found' : 'Not Verified';
  return (
    <span onClick={() => onChange(nextStatus)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer', backgroundColor: unverified ? '#fffbeb' : ok ? '#dcfce7' : '#fee2e2', color, border: `1px solid ${unverified ? '#fde68a' : ok ? '#bbf7d0' : '#fecaca'}`, whiteSpace: 'nowrap' }}>
      {ok
        ? <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5L8.5 2" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        : unverified ? <Info size={10} /> : <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" /></svg>}
      {status}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className="report-editor-section-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div className="report-editor-section-icon" style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color, border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color="#ffffff" strokeWidth={2.5} style={{ display: 'block', width: 18, height: 18, flexShrink: 0 }} />
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
  );
}

function australianStatusColor(value: string) {
  const status = value.trim().toLowerCase();
  if (status.includes('clear') || status.includes('pass') || status === 'verified') return '#15803d';
  if (status.includes('failed') || status.includes('recorded') || status.includes('adverse') || status.includes('immediate')) return '#dc2626';
  if (status.includes('warning') || status.includes('attention') || status.includes('not verified') || status.includes('not assessed') || status.includes('not inspected')) return '#b45309';
  return '#334155';
}

function AustralianFieldGrid({ fields }: { fields: Array<{ label: string; value: string; onChange: (value: string) => void }> }) {
  return (
    <div className="report-editor-au-grid">
      {fields.map(({ label, value, onChange }) => (
        <div key={label} className="report-editor-au-field">
          <span>{label}</span>
          <strong
            className={/(status|check|verification|rating|assessment|condition|warning|risk)/i.test(label) ? 'report-editor-au-status' : undefined}
            style={{
              color: australianStatusColor(value),
              borderColor: australianStatusColor(value) + '40',
              backgroundColor: /(status|check|verification|rating|assessment|condition|warning|risk)/i.test(label)
                ? australianStatusColor(value) + '12'
                : 'transparent',
            }}
          >
            <E value={value} onChange={onChange} multiline={value.length > 42} />
          </strong>
        </div>
      ))}
    </div>
  );
}

function AustralianRecordList({
  title,
  records,
  fields,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  records: AustralianRecord[];
  fields: ReadonlyArray<readonly [string, string]>;
  onAdd: () => void;
  onChange: (index: number, key: string, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="report-editor-au-record-list">
      <div className="report-editor-au-subheading">
        <h3>{title}</h3>
        <button className="no-print" type="button" onClick={onAdd}>
          <Plus size={14} /> Add record
        </button>
      </div>
      {records.length === 0 ? (
        <p className="report-editor-au-empty">No records entered.</p>
      ) : records.map((record, index) => (
        <div key={index} className="report-editor-au-record">
          <div className="report-editor-au-record-title">
            <strong>Record {index + 1}</strong>
            <button className="no-print" type="button" onClick={() => onRemove(index)} aria-label={`Remove ${title} record ${index + 1}`}>
              <Trash2 size={14} />
            </button>
          </div>
          <AustralianFieldGrid
            fields={fields.map(([label, key]) => ({
              label,
              value: record[key] ?? 'Not Available',
              onChange: (value) => onChange(index, key, value),
            }))}
          />
        </div>
      ))}
    </div>
  );
}

// ─── SubSection Header ────────────────────────────────────────────────────────
function SubHeader({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '0.03em', textTransform: 'uppercase' as const }}>{title}</span>
    </div>
  );
}

// ─── Data Row ─────────────────────────────────────────────────────────────────
function DataRow({ label, value, last = false }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: last ? 'none' : '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: '#7a7a7a', fontWeight: 400 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

// ─── Two Column Row ───────────────────────────────────────────────────────────
function TwoCol({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`report-editor-two-col ${className}`.trim()} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>{children}</div>;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function mixHex(baseHex: string, mixHexColor: string, amount: number) {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHexColor);
  if (!base || !mix) return baseHex;

  const mixAmount = Math.min(1, Math.max(0, amount));
  const channel = (start: number, end: number) => Math.round(start + (end - start) * mixAmount);
  return `#${[channel(base.r, mix.r), channel(base.g, mix.g), channel(base.b, mix.b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

function buildBrandTheme(color: string) {
  const base = hexToRgb(color) ? color : '#3B82F6';
  const light = mixHex(base, '#ffffff', 0.2);
  const dark = mixHex(base, '#0f172a', 0.16);
  return {
    base,
    light,
    dark,
    cover: `linear-gradient(135deg, ${light} 0%, ${base} 52%, ${dark} 100%)`,
    icon: `linear-gradient(145deg, ${light} 0%, ${base} 58%, ${dark} 100%)`,
    chip: `linear-gradient(135deg, ${light}22 0%, ${base}18 100%)`,
    soft: `linear-gradient(180deg, ${light}14 0%, ${dark}10 100%)`,
    footer: `linear-gradient(135deg, ${light}12, ${dark}0a)`,
  };
}

// ─── Main ReportEditor ────────────────────────────────────────────────────────
export function ReportEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    try {
      const row = getLocalReport(id);
      if (!row) throw new Error('Report not found');
      if (row) {
        setReport(row);
        const def = createDefaultReportData(row.make ?? undefined, row.model ?? undefined, row.year ?? undefined, row.mileage ?? undefined, row.plate_number ?? undefined, row.vin_number ?? undefined);
        const australianData = mergeAustralianReportData(def.australian, row.report_data?.australian);
        const reportReferenceNumber = australianData.dataSources.reportReferenceNumber === 'Not Available'
          ? `CR-${row.id.slice(0, 6).toUpperCase()}`
          : australianData.dataSources.reportReferenceNumber;
        const reportGenerationDate = australianData.dataSources.reportGenerationDate === 'Not Available'
          ? new Date(row.created_at).toLocaleDateString('en-AU')
          : australianData.dataSources.reportGenerationDate;
        setData({
          ...def,
          ...row.report_data,
          australian: {
            ...australianData,
            dataSources: {
              ...australianData.dataSources,
              reportReferenceNumber,
              reportGenerationDate,
            },
          },
        });
      }
    } catch {
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!report || !data) return;
    try {
      saveLocalReport({
        ...report,
        report_data: data,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving report locally:', error);
    }
  }, [report, data]);

  const set = useCallback(<K extends keyof ReportData>(key: K, value: ReportData[K]) => {
    setData((prev) => prev ? { ...prev, [key]: value } : prev);
  }, []);

  const setAustralianField = useCallback((group: AustralianFieldGroup, key: string, value: string) => {
    setData((prev) => prev ? {
      ...prev,
      australian: {
        ...prev.australian,
        [group]: { ...prev.australian[group], [key]: value },
      },
    } : prev);
  }, []);

  const setTyreField = useCallback((position: TyrePosition, key: string, value: string) => {
    setData((prev) => prev ? {
      ...prev,
      australian: {
        ...prev.australian,
        tyres: {
          ...prev.australian.tyres,
          [position]: { ...prev.australian.tyres[position], [key]: value },
        },
      },
    } : prev);
  }, []);

  const addAustralianRecord = useCallback((group: AustralianRecordGroup) => {
    const fields = AUSTRALIAN_RECORD_FIELDS[group];
    const record: AustralianRecord = {};
    fields.forEach(([, key]) => { record[key] = 'Not Available'; });
    setData((prev) => prev ? {
      ...prev,
      australian: {
        ...prev.australian,
        [group]: [...prev.australian[group], record],
      },
    } : prev);
  }, []);

  const updateAustralianRecord = useCallback((group: AustralianRecordGroup, index: number, key: string, value: string) => {
    setData((prev) => prev ? {
      ...prev,
      australian: {
        ...prev.australian,
        [group]: prev.australian[group].map((record, recordIndex) =>
          recordIndex === index ? { ...record, [key]: value } : record),
      },
    } : prev);
  }, []);

  const removeAustralianRecord = useCallback((group: AustralianRecordGroup, index: number) => {
    setData((prev) => prev ? {
      ...prev,
      australian: {
        ...prev.australian,
        [group]: prev.australian[group].filter((_, recordIndex) => recordIndex !== index),
      },
    } : prev);
  }, []);

  const handleSave = async (status?: 'draft' | 'completed') => {
    if (!report || !data) return;
    setSaving(true);
    try {
      const updatedReport = {
        ...report,
        report_data: data,
        status: status || report.status,
        vehicle_name: report.make && report.model ? `${report.make} ${report.model}` : null,
        updated_at: new Date().toISOString(),
      };
      saveLocalReport(updatedReport);
      setReport(updatedReport);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleExportPDF = useCallback(() => {
    const active = document.activeElement as HTMLElement | null;
    active?.blur();
    window.requestAnimationFrame(() => {
      window.print();
    });
  }, []);

  const editableText = (value: ReportData[keyof ReportData]) => {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
  };

  const updateNumericField = (key: 'accidentsCount' | 'recallsCount' | 'titleRecordsCount' | 'junkSalvageCount' | 'totalLossCount' | 'problemChecksCount', value: string) => {
    if (!data) return;
    const parsed = Number(value);
    set(key, value.trim() && Number.isFinite(parsed) ? parsed : null);
  };

  if (loading || !report || !data) {
    return <div className="report-editor-page" style={{ minHeight: 400 }} />;
  }

  const C = report.brand_color;
  const brandTheme = buildBrandTheme(C);
  const reportId = `CR-${report.id.slice(0, 6).toUpperCase()}`;
  const searchDate = data.searchDate || new Date(report.created_at).toLocaleDateString('en-GB');
  const sectionIcons: Record<AustralianFieldGroup, React.ElementType> = {
    registration: ClipboardList,
    ppsr: Scale,
    damageHistory: AlertTriangle,
    odometer: Gauge,
    mechanical: Wrench,
    engineAssessment: Cog,
    diagnostics: FileText,
    exterior: Car,
    interior: Tag,
    safety: ShieldCheck,
    recalls: RotateCcw,
    valuation: Tag,
    fuelEnvironment: Fuel,
    ownership: Info,
    reliability: CheckSquare,
    serviceHistory: Calendar,
    overallHealth: CheckSquare,
    dataSources: FileText,
  };

  const renderRecordList = (group: AustralianRecordGroup, title: string) => (
    <AustralianRecordList
      title={title}
      records={data.australian[group]}
      fields={AUSTRALIAN_RECORD_FIELDS[group]}
      onAdd={() => addAustralianRecord(group)}
      onChange={(index, key, value) => updateAustralianRecord(group, index, key, value)}
      onRemove={(index) => removeAustralianRecord(group, index)}
    />
  );

  const standardField = (
    label: string,
    value: string | number | null | undefined,
    onChange: (nextValue: string) => void,
  ): StandardReportField => ({
    label,
    value: value === null || value === undefined || value === '' ? 'Not Available' : String(value),
    onChange: (nextValue) => onChange(nextValue),
  });

  const auField = (group: AustralianFieldGroup, key: string, label?: string) => standardField(
    label ?? AUSTRALIAN_SECTIONS.find((section) => section.group === group)?.fields.find((field) => field.key === key)?.label ?? key,
    data.australian[group][key],
    (value) => setAustralianField(group, key, value),
  );

  const standardPages: Array<{ title: string; icon: React.ElementType; fields: StandardReportField[] }> = [
    {
      title: 'Vehicle Summary',
      icon: ClipboardList,
      fields: [
        standardField('Vehicle', data.vehicleDisplay, (value) => set('vehicleDisplay', value)),
        standardField('Registration Number', data.plateNumber, (value) => set('plateNumber', value)),
        standardField('VIN', report.vin_number, (value) => {
          setReport((current) => current ? { ...current, vin_number: value } : current);
        }),
        standardField('Odometer (km)', data.currentMileage, (value) => set('currentMileage', value)),
        standardField('Registration Status', data.australian.registration.registrationStatus, (value) => setAustralianField('registration', 'registrationStatus', value)),
        standardField('PPSR Search Status', data.australian.ppsr.searchStatus, (value) => setAustralianField('ppsr', 'searchStatus', value)),
        standardField('Overall Health Assessment', data.australian.overallHealth.finalVehicleAssessment, (value) => setAustralianField('overallHealth', 'finalVehicleAssessment', value)),
        standardField(
          'Report Reference',
          data.australian.dataSources.reportReferenceNumber,
          (value) => setAustralianField('dataSources', 'reportReferenceNumber', value),
        ),
      ],
    },
    {
      title: 'Registration, Compliance & PPSR',
      icon: ClipboardList,
      fields: [
        auField('registration', 'registrationStatus'),
        auField('registration', 'registrationRegion'),
        auField('registration', 'registrationExpiryDate'),
        auField('registration', 'vinVerification'),
        auField('registration', 'roadworthinessCertificateStatus'),
        auField('ppsr', 'searchStatus'),
        auField('ppsr', 'financialEncumbranceStatus'),
        auField('ppsr', 'outstandingFinanceStatus'),
        auField('ppsr', 'wovrStatus'),
        auField('ppsr', 'stolenVehicleStatus'),
      ],
    },
    {
      title: 'Written-Off, Accident & Odometer History',
      icon: AlertTriangle,
      fields: [
        auField('damageHistory', 'accidentRecordsStatus'),
        auField('damageHistory', 'statutoryWriteOffCheck'),
        auField('damageHistory', 'repairableWriteOffCheck'),
        auField('damageHistory', 'structuralDamageHistory'),
        auField('damageHistory', 'floodDamageHistory'),
        auField('damageHistory', 'insuranceClaimRecords'),
        auField('odometer', 'currentOdometerReading'),
        auField('odometer', 'odometerReadingDate'),
        auField('odometer', 'odometerDiscrepancyCheck'),
        auField('odometer', 'mileageConsistencyStatus'),
      ],
    },
    {
      title: 'Mechanical & Powertrain Inspection',
      icon: Wrench,
      fields: [
        auField('mechanical', 'EngineCondition'),
        auField('mechanical', 'TransmissionCondition'),
        auField('mechanical', 'BrakeSystem'),
        auField('mechanical', 'SuspensionSystem'),
        auField('mechanical', 'SteeringSystem'),
        auField('mechanical', 'CoolingSystem'),
        auField('mechanical', 'OilLeakage'),
        auField('mechanical', 'BatteryCondition'),
        auField('engineAssessment', 'EnginePerformance'),
        auField('engineAssessment', 'GearboxCondition'),
        auField('engineAssessment', 'EngineFaultIndicators'),
      ],
    },
    {
      title: 'Diagnostics & Exterior Condition',
      icon: FileText,
      fields: [
        auField('diagnostics', 'scanStatus'),
        auField('diagnostics', 'checkEngineLightStatus'),
        auField('diagnostics', 'engineDtcCodes'),
        auField('diagnostics', 'transmissionDtcCodes'),
        auField('exterior', 'FrontBumper'),
        auField('exterior', 'Bonnet'),
        auField('exterior', 'Windscreen'),
        auField('exterior', 'PaintCondition'),
        auField('exterior', 'RustandCorrosion'),
        auField('exterior', 'PanelAlignment'),
      ],
    },
    {
      title: 'Interior, Tyres, Wheels & Brakes',
      icon: Gauge,
      fields: [
        auField('interior', 'DashboardCondition'),
        auField('interior', 'SeatsCondition'),
        auField('interior', 'AirConditioning'),
        standardField('Front Left Tyre', data.australian.tyres['Front Left'].TyreCondition, (value) => setTyreField('Front Left', 'TyreCondition', value)),
        standardField('Front Right Tyre', data.australian.tyres['Front Right'].TyreCondition, (value) => setTyreField('Front Right', 'TyreCondition', value)),
        standardField('Rear Left Tyre', data.australian.tyres['Rear Left'].TyreCondition, (value) => setTyreField('Rear Left', 'TyreCondition', value)),
        standardField('Rear Right Tyre', data.australian.tyres['Rear Right'].TyreCondition, (value) => setTyreField('Rear Right', 'TyreCondition', value)),
        standardField('Spare Tyre', data.australian.tyres.Spare.TyreCondition, (value) => setTyreField('Spare', 'TyreCondition', value)),
        standardField('Wheel Condition', data.australian.tyres.general.WheelCondition, (value) => setTyreField('general', 'WheelCondition', value)),
        standardField('Brake Pads', data.australian.tyres.general.BrakePads, (value) => setTyreField('general', 'BrakePads', value)),
        standardField('Wheel Alignment', data.australian.tyres.general.WheelAlignment, (value) => setTyreField('general', 'WheelAlignment', value)),
      ],
    },
    {
      title: 'Safety, Recalls & Service',
      icon: ShieldCheck,
      fields: [
        auField('safety', 'ancapSafetyRating'),
        auField('safety', 'autonomousEmergencyBraking'),
        auField('safety', 'laneDepartureWarning'),
        auField('safety', 'blindSpotMonitoring'),
        auField('safety', 'rearViewCamera'),
        auField('recalls', 'recallStatus'),
        standardField('Recall Records', String(data.australian.recallRecords.length), () => {}),
        auField('serviceHistory', 'serviceHistoryStatus'),
        standardField('Service Records', String(data.australian.serviceRecords.length), () => {}),
      ],
    },
    {
      title: 'Value, Usage & Final Assessment',
      icon: CheckSquare,
      fields: [
        auField('valuation', 'estimatedMarketValue'),
        auField('valuation', 'privateSaleValue'),
        auField('fuelEnvironment', 'combinedFuelConsumption'),
        auField('ownership', 'privateCommercialUse'),
        auField('ownership', 'importStatus'),
        auField('reliability', 'reliabilityAssessment'),
        auField('overallHealth', 'healthScore'),
        auField('overallHealth', 'mechanicalRating'),
        auField('overallHealth', 'historyRiskAssessment'),
        auField('overallHealth', 'financialRiskAssessment'),
        auField('dataSources', 'dataRetrievalDate'),
        auField('dataSources', 'importantDisclaimer'),
      ],
    },
  ];

  // Inline styles for document font
  const docStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', 'Inter', Arial, sans-serif",
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 1.5,
  };

  const sectionBox: React.CSSProperties = {
    padding: '28px 36px',
    borderBottom: '1px solid #f0f4f8',
    background: 'white',
  };

  return (
    <div className="report-editor-page" style={{ paddingBottom: 40 }}>
      <style>{`
        .report-editor-section-header > .report-editor-section-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          flex: 0 0 36px !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .report-editor-section-header > .report-editor-section-icon > svg {
          display: block !important;
          width: 18px !important;
          height: 18px !important;
          visibility: visible !important;
          opacity: 1 !important;
          stroke: #ffffff !important;
        }

        .report-editor-au-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 24px;
        }

        .report-editor-au-field {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          min-width: 0;
          padding: 11px 0;
          border-bottom: 1px solid #f1f5f9;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .report-editor-au-field > span {
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
          flex: 1;
        }

        .report-editor-au-field > strong {
          max-width: 58%;
          text-align: right;
          font-size: 12px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .report-editor-au-field > strong.report-editor-au-status {
          padding: 2px 9px;
          border: 1px solid;
          border-radius: 999px;
        }

        .report-editor-au-tyres-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 14px;
        }

        .report-editor-au-tyres .report-editor-au-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .report-editor-au-tyres .report-editor-au-field > strong.report-editor-au-status {
          white-space: nowrap;
        }

        .report-editor-au-record-list {
          margin-top: 20px;
        }

        .report-editor-au-subheading,
        .report-editor-au-record-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .report-editor-au-subheading h3 {
          margin: 0;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .report-editor-au-subheading button,
        .report-editor-au-record-title button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .report-editor-au-record-title button {
          border-color: #fecaca;
          background: #fff5f5;
          color: #dc2626;
        }

        .report-editor-au-record {
          margin-bottom: 12px;
          padding: 14px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .report-editor-au-record-title strong {
          color: #475569;
          font-size: 12px;
        }

        .report-editor-au-empty {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          font-style: italic;
        }

        .report-editor-standard-pages {
          display: none;
        }

        .report-editor-standard-page {
          position: relative;
          box-sizing: border-box;
          min-height: 277mm;
          padding: 12mm;
          overflow: hidden;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .report-editor-standard-page:last-child {
          border-bottom: 0;
        }

        .report-editor-standard-page-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 14px;
          margin-bottom: 22px;
          border-bottom: 2px solid #dbeafe;
        }

        .report-editor-standard-page-top strong {
          color: #1e3a8a;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .report-editor-standard-page-top span {
          color: #64748b;
          font-size: 10px;
        }

        .report-editor-standard-page .report-editor-section-header {
          margin-bottom: 22px;
        }

        .report-editor-standard-page .report-editor-au-grid {
          gap: 0 24px;
        }

        .report-editor-standard-page .report-editor-au-field {
          padding: 14px 0;
        }

        .report-editor-standard-page .report-editor-au-field > span,
        .report-editor-standard-page .report-editor-au-field > strong {
          font-size: 12px;
        }

        .report-editor-standard-page-footer {
          position: absolute;
          right: 12mm;
          bottom: 8mm;
          left: 12mm;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
          color: #94a3b8;
          font-size: 9px;
        }

        @media (max-width: 640px) {
          .report-editor-au-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .report-editor-au-tyres-grid {
            grid-template-columns: 1fr;
          }

          .report-editor-au-record {
            padding: 12px;
          }
        }

        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          aside,
          header,
          nav,
          .report-editor-toolbar,
          .report-editor-toolbar-actions,
          .no-print,
          button,
          .print-hidden {
            display: none !important;
          }

          .report-editor-page {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }

          main {
            padding: 0 !important;
          }

          .report-editor-page > p {
            display: none !important;
          }

          .report-editor-page .report-editor-document {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            min-height: auto !important;
            display: block !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #1e293b !important;
          }

          .report-editor-standard-pages {
            display: none !important;
          }

          .report-editor-page .report-editor-document > .flex-1 {
            display: block !important;
            flex: none !important;
            min-height: auto !important;
            padding: 0 !important;
          }

          .report-editor-page .report-editor-document > .flex-1.space-y-8 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 12px !important;
          }

          .report-editor-page .report-editor-document,
          .report-editor-page .report-editor-document * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .report-editor-page .report-editor-document [contenteditable='true'] {
            outline: none !important;
          }

        
          
          .report-editor-page .report-editor-document button {
            display: none !important;
          }

          .report-editor-page .report-editor-document button.report-editor-print-toggle {
            display: inline-flex !important;
          }

          .report-editor-page .report-editor-footer {
            position: static !important;
            margin-top: 0 !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .report-editor-page .report-editor-section {
            padding: 14px 16px !important;
          }

          .report-editor-page .report-editor-section-header {
            margin-bottom: 12px !important;
            break-after: avoid;
            page-break-after: avoid;
          }

          .report-editor-page .report-editor-section {
            break-inside: auto;
            page-break-inside: auto;
          }

          .report-editor-page .report-editor-au-field {
            padding: 7px 0;
          }

          .report-editor-page .report-editor-cover {
            padding: 18px 18px 20px !important;
          }

          .report-editor-page .report-editor-stat-grid > div {
            padding: 10px 6px !important;
          }

          .report-editor-page .report-editor-page-break-before {
            break-before: page;
            page-break-before: always;
          }

          .report-editor-page .report-editor-section > div[style*='margin-bottom: 22px'] {
            margin-bottom: 10px !important;
          }

          .report-editor-page .report-editor-safety-grid > div {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            align-items: center !important;
          }

          .report-editor-page .report-editor-safety-grid > div > span:first-child {
            line-height: 1.2 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            min-width: 0 !important;
          }

          .report-editor-page button.report-editor-print-toggle {
            min-width: 66px !important;
            height: auto !important;
            min-height: 18px !important;
            padding: 2px 8px !important;
            font-size: 9px !important;
            line-height: 1.2 !important;
          }

          .report-editor-page .report-editor-two-col,
          .report-editor-page .report-editor-legal-grid,
          .report-editor-page .report-editor-engine-grid,
          .report-editor-page .report-editor-fuel-grid,
          .report-editor-page .report-editor-general-grid,
          .report-editor-page .report-editor-core-grid,
          .report-editor-page .report-editor-problem-grid,
          .report-editor-page .report-editor-safety-grid,
          .report-editor-page .report-editor-security-grid {
            gap: 8px !important;
          }

          .report-editor-page .report-editor-problem-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .report-editor-page .report-editor-security-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .report-editor-page .report-editor-safety-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .report-editor-page .report-editor-core-grid,
          .report-editor-page .report-editor-engine-grid,
          .report-editor-page .report-editor-fuel-grid,
          .report-editor-page .report-editor-general-grid,
          .report-editor-page .report-editor-legal-grid,
          .report-editor-page .report-editor-two-col {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .report-editor-page {
            padding-bottom: 24px;
          }

          .report-editor-page .report-editor-toolbar {
            padding: 14px;
          }

          .report-editor-page .report-editor-toolbar-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .report-editor-page .report-editor-toolbar-actions button {
            width: 100%;
            justify-content: center;
          }

          .report-editor-page .report-editor-document {
            border-radius: 14px;
          }

          .report-editor-page .report-editor-section {
            padding: 18px 16px !important;
          }

          .report-editor-page .report-editor-cover {
            padding: 22px 16px 18px !important;
          }

          .report-editor-page .report-editor-cover-top {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .report-editor-page .report-editor-cover-title {
            font-size: 22px !important;
            line-height: 1.15 !important;
          }

          .report-editor-page .report-editor-cover h1,
          .report-editor-page .report-editor-section h2 {
            letter-spacing: -0.01em;
          }

          .report-editor-page .report-editor-section h2 {
            font-size: 17px !important;
            line-height: 1.2 !important;
            margin-bottom: 18px !important;
          }

          .report-editor-page .report-editor-section-header {
            align-items: flex-start !important;
            gap: 10px !important;
            margin-bottom: 18px !important;
          }

          .report-editor-page .report-editor-section-header > div {
            width: 32px !important;
            height: 32px !important;
            border-radius: 9px !important;
          }

          .report-editor-page .report-editor-section-header h2 {
            font-size: 16px !important;
            line-height: 1.25 !important;
            max-width: 100% !important;
            overflow-wrap: anywhere;
          }

          .report-editor-page .report-editor-cover-stats > div > div:last-child {
            font-size: 14px !important;
            line-height: 1.25 !important;
          }

          .report-editor-page .report-editor-cover-stats > div > div:first-child span {
            font-size: 9px !important;
          }

          .report-editor-page .report-editor-two-col {
            grid-template-columns: 1fr !important;
          }

          .report-editor-page .report-editor-two-col > div {
            padding-left: 0 !important;
            padding-right: 0 !important;
            border-right: none !important;
          }

          .report-editor-page .report-editor-cover-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }

          .report-editor-page .report-editor-cover-stats > div {
            padding: 0 !important;
            border-right: none !important;
          }

          .report-editor-page .report-editor-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .report-editor-page .report-editor-badge-grid,
          .report-editor-page .report-editor-legal-grid,
          .report-editor-page .report-editor-core-grid,
          .report-editor-page .report-editor-general-grid,
          .report-editor-page .report-editor-engine-grid,
          .report-editor-page .report-editor-fuel-grid,
          .report-editor-page .report-editor-safety-grid,
          .report-editor-page .report-editor-security-grid,
          .report-editor-page .report-editor-problem-grid {
            grid-template-columns: 1fr !important;
          }

          .report-editor-page .report-editor-badge-grid > div,
          .report-editor-page .report-editor-legal-grid > div,
          .report-editor-page .report-editor-core-grid > div,
          .report-editor-page .report-editor-general-grid > div,
          .report-editor-page .report-editor-engine-grid > div,
          .report-editor-page .report-editor-fuel-grid > div,
          .report-editor-page .report-editor-safety-grid > div,
          .report-editor-page .report-editor-security-grid > div,
          .report-editor-page .report-editor-problem-grid > div {
            border-right: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .report-editor-page .report-editor-stat-grid > div {
            padding: 14px 6px !important;
          }

          .report-editor-page .report-editor-stat-grid > div > span:first-of-type {
            font-size: 24px !important;
          }

          .report-editor-page .report-editor-stat-grid > div > span:last-of-type {
            font-size: 9px !important;
            line-height: 1.2 !important;
          }

          .report-editor-page .report-editor-row-stack,
          .report-editor-page .report-editor-footer {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .report-editor-page .report-editor-footer {
            text-align: center;
          }
        }
      `}</style>
      {/* ── Toolbar ── */}
      <div className="report-editor-toolbar print-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} title="Back to saved reports" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Report Editor</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{report.make} {report.model} — Click any value to edit inline</p>
          </div>
        </div>
        <div className="report-editor-toolbar-actions flex items-center gap-2">
          <button onClick={() => handleSave()} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave('completed')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg"
            style={{ background: brandTheme.soft, boxShadow: `0 4px 14px ${brandTheme.base}40` }}>
            <CheckCircle className="w-4 h-4" />Complete
          </button>
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold rounded-xl hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50">
            <Download className="w-4 h-4" />Export PDF
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-4">
        Click any value in the report below to edit. All changes appear exactly in the downloaded PDF.
      </p>

      {/* ══════ REPORT DOCUMENT ══════ */}
      <div ref={reportRef} style={{ paddingBottom: 40 }}>
        <div className="report-editor-document" data-package={report.package_type} style={{ width: '100%', maxWidth: 794, margin: '0 auto', background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 0 0 1px #e2e8f0, 0 20px 60px rgba(0,0,0,0.08)', boxSizing: 'border-box', ...docStyle }}>

          <div className="report-editor-full-report">
          {/* ══ COVER HEADER ══ */}
          <div className="report-editor-cover" style={{ background: brandTheme.cover, padding: '32px 36px 36px', position: 'relative', overflow: 'hidden', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,0,0,0.15)' }} />
            <div style={{ position: 'absolute', top: 20, right: 60, width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

            {/* Top bar: Logo + Report ID */}
            <div className="report-editor-cover-top" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, position: 'relative' }}>
              {/* Logo */}
              <div style={{ background: 'white', borderRadius: 14, padding: '8px 14px', minWidth: 80, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {report.logo_url
                  ? <img src={report.logo_url} alt="Logo" style={{ maxHeight: 44, maxWidth: 110, objectFit: 'contain' }} />
                  : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Car size={22} color={C} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: C }}>{report.brand?.name?.slice(0, 3).toUpperCase()}</span>
                  </div>}
              </div>
              {/* Report ID */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 3, height: 20, background: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Report ID</div>
                  <div style={{ fontSize: 13, color: 'white', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    <E value={reportId} onChange={() => { }} className="text-white" style={{ color: 'white', fontFamily: 'monospace' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Official badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: brandTheme.chip, border: `1px solid ${brandTheme.light}40`, borderRadius: 99, marginBottom: 20 }}>
              <CheckSquare size={12} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.92)', fontWeight: 500, letterSpacing: '0.02em' }}>Official Vehicle History Audit Report | Comprehensive &amp; Detailed</span>
            </div>

            {/* Vehicle Name */}
            <h1 className="report-editor-cover-title" style={{ fontSize: 36, fontWeight: 800, color: 'white', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>
              <E value={data.vehicleDisplay} onChange={(v) => set('vehicleDisplay', v)} style={{ color: 'white' }} />
            </h1>

            {/* Plate Number */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24, background: 'rgba(255,255,255,0.12)', padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)' }}>
              <Car size={14} color="rgba(255,255,255,0.75)" />
              <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.18em', color: 'white', fontSize: 15 }}>
                <E value={data.plateNumber} onChange={(v) => set('plateNumber', v)} style={{ color: 'white', fontFamily: 'monospace', letterSpacing: '0.18em' }} />
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', marginBottom: 22 }} />

            {/* 4-stat Row */}
            <div className="report-editor-cover-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { label: 'Year / Model', icon: Calendar, val: report.year ? String(report.year) : '---', key: null as null },
                { label: 'Current Mileage', icon: Gauge, val: data.currentMileage, key: 'currentMileage' as const },
                { label: 'Market Value', icon: Tag, val: data.marketValue, key: 'marketValue' as const },
                { label: 'Search Date', icon: Calendar, val: searchDate, key: 'searchDate' as const },
              ].map(({ label, icon: Icon, val, key }, i) => (
                <div key={i} style={{ paddingRight: i < 3 ? 20 : 0, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none', paddingLeft: i > 0 ? 20 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Icon size={11} color="#ffffff" strokeWidth={2.2} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
                    {key === 'searchDate'
                      ? <E value={searchDate} onChange={(v) => set('searchDate', v)} style={{ color: 'white' }} />
                      : key ? <E value={editableText(data[key as keyof ReportData])} onChange={(v) => set(key as keyof ReportData, v as never)} style={{ color: 'white' }} /> : val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ STAT BADGES ROW ══ */}
          <div className="report-editor-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', borderBottom: '1px solid #f0f4f8' }}>
            {[
              { key: 'accidentsCount' as const, val: data.accidentsCount, label: 'Accidents', icon: AlertTriangle },
              { key: 'recallsCount' as const, val: data.recallsCount, label: 'Recalls', icon: RotateCcw },
              { key: 'titleRecordsCount' as const, val: data.titleRecordsCount, label: 'Title Records', icon: FileText },
              { key: 'junkSalvageCount' as const, val: data.junkSalvageCount, label: 'Junk/Salvage', icon: Trash2 },
              { key: 'totalLossCount' as const, val: data.totalLossCount, label: 'Total Loss', icon: TrendingDown },
              { key: 'problemChecksCount' as const, val: data.problemChecksCount, label: 'Problem Checks', icon: AlertCircle },
            ].map(({ key, val, label, icon: Icon }, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '20px 8px', borderRight: i < 5 ? '1px solid #f0f4f8' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: brandTheme.icon, border: `1.5px solid ${C}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon size={16} color="#ffffff" strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>
                  <E value={String(val ?? 0)} onChange={(v) => updateNumericField(key, v)} style={{ color: '#0f172a' }} />
                </span>
                <span style={{ fontSize: 10, color: '#7a7a7a', textAlign: 'center', fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ══ EXECUTIVE SUMMARY ══ */}
          <div className="report-editor-section" style={{ ...sectionBox }}>
            <SectionHeader icon={ClipboardList} title="Executive Summary & Vehicle Identity" color={C} />
            <TwoCol>
              <div style={{ paddingRight: 24, borderRight: '1px solid #f0f4f8' }}>
                <DataRow label="Vehicle" value={<E value={data.vehicleDisplay} onChange={(v) => set('vehicleDisplay', v)} />} />
                <DataRow label="Current Mileage" value={<E value={data.currentMileage} onChange={(v) => set('currentMileage', v)} />} />
                <DataRow label="Accidents" value={<StatusBadge status={data.accidentsStatus} onChange={(v) => set('accidentsStatus', v)} />} />
                <DataRow label="Total Loss" value={<StatusBadge status={data.totalLossStatus} onChange={(v) => set('totalLossStatus', v)} />} />
                <DataRow label="Recalls" value={<StatusBadge status={data.recallsStatus} onChange={(v) => set('recallsStatus', v)} />} last />
              </div>
              <div style={{ paddingLeft: 24 }}>
                <DataRow label="Plate Number" value={<E value={data.plateNumber} onChange={(v) => set('plateNumber', v)} style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }} />} />
                <DataRow label="Title Records" value={<StatusBadge status={data.titleRecordsStatus} onChange={(v) => set('titleRecordsStatus', v)} />} />
                <DataRow label="Junk/Salvage" value={<StatusBadge status={data.junkSalvageStatus} onChange={(v) => set('junkSalvageStatus', v)} />} />
                <DataRow label="Problem Checks" value={<StatusBadge status={data.problemChecksStatus} onChange={(v) => set('problemChecksStatus', v)} />} last />
              </div>
            </TwoCol>

            {/* History verification note */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1.5px solid #fcd34d', borderRadius: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'white', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Info size={14} color="#b45309" />
              </div>
              <p style={{ fontSize: 13, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                <strong>History Review:</strong>{' '}
                <E value={data.greatNewsMessage} onChange={(v) => set('greatNewsMessage', v)} multiline style={{ color: '#92400e' }} />
              </p>
            </div>
          </div>

          {/* ══ LEGAL CHECKS ══ */}
          <div className="report-editor-section report-editor-page-break-before" style={{ ...sectionBox }}>
            <SectionHeader icon={Scale} title="Legal Checks" color={C} />
            <div className="report-editor-legal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {[
                { label: 'Financial & Legal Status', key: 'financialLegalStatus' as const, icon: Scale },
                { label: 'Insurance Write-off', key: 'insuranceWriteoffStatus' as const, icon: ShieldCheck },
                { label: 'Accident Records', key: 'accidentRecordsStatus' as const, icon: AlertTriangle },
                { label: 'Theft / Stolen Markers', key: 'theftStolenStatus' as const, icon: Lock },
              ].map(({ label, key, icon: Icon }, i) => {
                const val = data[key];
                const ok = val.toLowerCase() === 'clear';
                return (
                  <div key={key} onClick={() => set(key, ok ? 'Issue Found' : 'Clear')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < 2 ? '1px solid #f0f4f8' : 'none', borderRight: i % 2 === 0 ? '1px solid #f0f4f8' : 'none', cursor: 'pointer', transition: 'background 0.15s', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 20, background: C, borderRadius: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 500, marginBottom: 1 }}>{label}</div>
                        <Icon size={11} color="#cbd5e1" />
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: ok ? '#0f172a' : '#ef4444', letterSpacing: '-0.01em' }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══ CORE VEHICLE SPECS ══ */}
          <div className="report-editor-section report-editor-page-break-before" style={{ ...sectionBox }}>
            <SectionHeader icon={Car} title="Core Vehicle Specifications" color={C} />
            <div className="report-editor-core-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {([
                ['Colour', 'colour', 'Engine', 'engine'],
                ['Max Torque', 'maxTorque', 'Top Speed', 'topSpeed'],
                ['Gear Box', 'gearbox', 'Market Value', 'marketValue'],
                ['Last Reported Mileage', 'lastReportedMileage', 'Estimated Mileage', 'estimatedMileage'],
              ] as [string, keyof ReportData, string | null, (keyof ReportData) | null][]).map(([l1, k1, l2, k2], ri) => (
                <React.Fragment key={ri}>
                  <div style={{ padding: '11px 0', paddingRight: 24, borderBottom: '1px solid #f8fafc', borderRight: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#7a7a7a', fontWeight: 400 }}>{l1}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                      <E value={editableText(data[k1])} onChange={(v) => set(k1, v as never)} />
                    </span>
                  </div>
                  <div style={{ padding: '11px 0', paddingLeft: 24, borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {k2 && <><span style={{ fontSize: 13, color: '#7a7a7a', fontWeight: 400 }}>{l2}</span><span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}><E value={editableText(data[k2])} onChange={(v) => set(k2!, v as never)} /></span></>}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ══ GENERAL STATUS ══ */}
          <div className="report-editor-section" style={{ ...sectionBox }}>
            <SectionHeader icon={Info} title="General Status & Basic History" color={C} />
            <div className="report-editor-general-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div style={{ paddingRight: 24, borderRight: '1px solid #f0f4f8' }}>
                <DataRow label="Vehicle Class" value={<E value={editableText(data.vehicleClass)} onChange={(v) => set('vehicleClass', v)} />} last />
              </div>
              <div style={{ paddingLeft: 24 }}>
                <DataRow label="Consumption (City)" value={<E value={editableText(data.consumptionCity)} onChange={(v) => set('consumptionCity', v)} />} />
                <DataRow label="Wheel Plan" value={<E value={editableText(data.wheelPlan)} onChange={(v) => set('wheelPlan', v)} />} last />
              </div>
            </div>
          </div>
          {/* ══ ENGINE & TRANSMISSION ══ */}
          <div className="report-editor-section report-editor-page-break-before" style={{ ...sectionBox }}>
            <SectionHeader icon={Cog} title="Engine & Transmission Technical Details" color={C} />
            <div className="report-editor-engine-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {([
                ['Cylinders', 'cylinders', 'Cam Type', 'camType'],
                ['Fuel Induction', 'fuelInduction', 'Fuel Type', 'fuelType'],
                ['Valves', 'valves', 'Max Horsepower', 'maxHorsepower'],
                ['Total Max Torque', 'totalMaxTorque', 'Transmission', 'transmissionEngine'],
              ] as [string, keyof ReportData, string, keyof ReportData][]).map(([l1, k1, l2, k2], ri) => (
                <React.Fragment key={ri}>
                  <div style={{ padding: '11px 0', paddingRight: 24, borderBottom: '1px solid #f8fafc', borderRight: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#7a7a7a' }}>{l1}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}><E value={editableText(data[k1])} onChange={(v) => set(k1, v as never)} /></span>
                  </div>
                  <div style={{ padding: '11px 0', paddingLeft: 24, borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#7a7a7a' }}>{l2}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}><E value={editableText(data[k2])} onChange={(v) => set(k2, v as never)} /></span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ══ FUEL EFFICIENCY ══ */}
          <div className="report-editor-section" style={{ ...sectionBox }}>
            <SectionHeader icon={Fuel} title="Fuel Efficiency Details" color={C} />
            <div className="report-editor-fuel-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {([
                ['Fuel Grade', 'fuelGrade', 'City Economy', 'cityEconomy'],
                ['Highway Economy', 'highwayEconomy', 'Combined Economy', 'combinedEconomy'],
              ] as [string, keyof ReportData, string, keyof ReportData][]).map(([l1, k1, l2, k2], ri) => (
                <React.Fragment key={ri}>
                  <div style={{ padding: '11px 0', paddingRight: 24, borderBottom: ri === 0 ? '1px solid #f8fafc' : 'none', borderRight: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#7a7a7a' }}>{l1}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}><E value={editableText(data[k1])} onChange={(v) => set(k1, v as never)} /></span>
                  </div>
                  <div style={{ padding: '11px 0', paddingLeft: 24, borderBottom: ri === 0 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#7a7a7a' }}>{l2}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}><E value={editableText(data[k2])} onChange={(v) => set(k2, v as never)} /></span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ══ TITLE BRAND & PROBLEM CHECKS ══ */}
          <div className="report-editor-section" style={{ ...sectionBox }}>
            <SectionHeader icon={Tag} title="Title Brand & Problem Checks (Comprehensive)" color={C} />

            {[
              { title: 'Damage & Salvage Checks', items: [['Flood Damage', 'floodDamage'], ['Fire Damage', 'fireDamage'], ['Hail Damage', 'hailDamage'], ['Junk', 'junkTitle'], ['Totaled', 'totaled'], ['Salvage', 'salvage'], ['Former Rental', 'formerRental']] },
              { title: 'Title History Checks', items: [['Prior Taxi', 'priorTaxi'], ['Odometer Not Actual', 'odometerNotActual'], ['Vandalism', 'vandalism'], ['Rebuilt', 'rebuilt'], ['Dismantled', 'dismantled'], ['Collision', 'collision'], ['Prior Police', 'priorPolice']] },
              { title: 'Warranty & Status Checks', items: [['Warranty Return', 'warrantyReturn'], ['Parts Only', 'partsOnly'], ['Recovered Theft', 'recoveredTheft'], ['Undisclosed Lien', 'undisclosedLien'], ['Antique / Classic', 'antiqueClassic'], ['Agricultural Vehicle', 'agriculturalVehicle'], ['Reissued VIN', 'reissuedVIN']] },
              { title: 'Safety & Defect Checks', items: [['Manufacturer Buy Back', 'manufacturerBuyBack'], ['Salvage / Stolen', 'salvageStolen'], ['Crushed', 'crushed'], ['Inoperable Vehicle', 'inoperableVehicle'], ['Hazardous', 'hazardous'], ['Export Only Vehicle', 'exportOnlyVehicle'], ['Odometer Tampering', 'odometerTampering'], ['Gray Market', 'grayMarket']] },
              { title: 'Odometer & Discrepancy Checks', items: [['Odometer Exceeds Limits', 'odometerExceedsLimits'], ['Odometer Altered', 'odometerAltered'], ['Odometer Replaced', 'odometerReplaced'], ['Odometer Discrepancy', 'odometerDiscrepancy'], ['Pending Junk', 'pendingJunk'], ['Junk Automobile', 'junkAutomobile']] },
            ].map(({ title, items }) => (
              <div
                key={title}
                className={title === 'Warranty & Status Checks' ? 'report-editor-page-break-before' : undefined}
                style={{ marginBottom: 22 }}
              >
                <SubHeader title={title} color={C} />
                <div className="report-editor-problem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                  {(items as [string, keyof ReportData][]).map(([lbl, k]) => (
                    <EBool key={k} label={lbl} value={data[k] as boolean | null} onChange={(v) => set(k as BooleanReportDataKey, v)} />
                  ))}
                </div>
              </div>
            ))}

            {/* Recalls callout */}
            <div style={{ borderLeft: `4px solid ${C}`, borderRadius: '0 12px 12px 0', background: 'linear-gradient(90deg, #fafafa, white)', padding: '16px 20px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Recalls Section</span>
              </div>
              <StatusBadge status={data.recallsStatus} onChange={(value) => set('recallsStatus', value)} />
              <p style={{ fontSize: 13, color: '#7a7a7a', margin: 0, lineHeight: 1.6 }}>
                <E value={data.recallsMessage} onChange={(v) => set('recallsMessage', v)} multiline style={{ color: '#7a7a7a' }} />
              </p>
            </div>
          </div>

          {/* ══ SAFETY FEATURES ══ */}
          <div className="report-editor-section report-editor-page-break-before" style={{ ...sectionBox }}>
            <SectionHeader icon={ShieldCheck} title="Safety & Security Assessment" color={C} />
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
              {([
                [['Front Airbags', 'frontAirbags'], ['Side Airbags', 'sideAirbags'], ['Curtain Airbags', 'sideCurtainAirbags']],
                [['ABS', 'abs'], ['Braking Assist', 'brakingAssist'], ['Electronic Brakeforce Distribution', 'electronicBrakeforceDistribution']],
                [['Active Head Restraints', 'activeHeadRestraints'], ['Child Safety Door Locks', 'childSafetyDoorLocks'], ['Child Seat Anchors', 'childSeatAnchors']],
                [['Crumple Zones', 'crumpleZones'], ['Emergency Interior Trunk Release', 'emergencyInteriorTrunkRelease'], ['', '']],
              ] as [string, keyof ReportData][][]).map((row, ri) => (
                <div key={ri} className="report-editor-safety-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: ri < 3 ? '1px solid #f0f4f8' : 'none' }}>
                  {row.map(([lbl, k], ci) => (
                    <div key={ci} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', paddingRight: ci < 2 ? 20 : 0, paddingLeft: ci > 0 ? 20 : 0, borderRight: ci < 2 ? '1px solid #f0f4f8' : 'none', gap: 8 }}>
                      {lbl && k ? (
                        <>
                          <span style={{ fontSize: 13, color: '#7a7a7a', flex: 1, whiteSpace: 'nowrap' }}>{lbl}</span>
                          <EToggle value={data[k] as 'Equipped' | 'Not Equipped' | 'Not Verified'} onChange={(v) => set(k as EquipmentReportDataKey, v)} color={C} />
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <SubHeader title="Additional Safety & Security Equipment" color={C} />
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
              {([
                [['Hill Holder Control', 'hillHolderControl'], ['Electronic Stability Control', 'stabilityControl']],
                [['Traction Control', 'tractionControl'], ['Immobiliser', 'antiTheftSystem']],
                [['Power Door Locks', 'powerDoorLocks'], ['Front Seatbelts', 'frontSeatbelts']],
                [['Rear Seatbelts', 'rearSeatbelts'], ['Seatbelt Pretensioners', 'seatbeltPretensioners']],
                [['Seatbelt Warning Sensor', 'seatbeltWarningSensor'], ['', '']],
              ] as [string, keyof ReportData][][]).map((row, ri) => (
                <div key={ri} className="report-editor-security-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: ri < 4 ? '1px solid #f0f4f8' : 'none' }}>
                  {row.map(([lbl, k], ci) => (
                    <div key={ci} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', paddingRight: ci === 0 ? 28 : 0, paddingLeft: ci > 0 ? 28 : 0, borderRight: ci === 0 ? '1px solid #f0f4f8' : 'none', gap: 8 }}>
                      {lbl && k ? (
                        <>
                          <span style={{ fontSize: 13, color: '#7a7a7a' }}>{lbl}</span>
                          <EToggle value={data[k] as 'Equipped' | 'Not Equipped' | 'Not Verified'} onChange={(v) => set(k as EquipmentReportDataKey, v)} color={C} />
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <SubHeader title="Australian Vehicle-Specific Safety Equipment" color={C} />
            <AustralianFieldGrid
              fields={(AUSTRALIAN_SECTIONS.find((section) => section.group === 'safety')?.fields ?? [])
                .filter(({ key }) => !['frontAirbags', 'sideAirbags', 'curtainAirbags', 'abs', 'electronicStabilityControl', 'tractionControl', 'immobiliser'].includes(key))
                .map(({ label, key }) => ({
                  label,
                  value: data.australian.safety[key] ?? 'Not Verified',
                  onChange: (value) => setAustralianField('safety', key, value),
                }))}
            />
          </div>

          {AUSTRALIAN_SECTIONS
            .filter((section) => section.group !== 'safety')
            .map((section, sectionIndex) => {
              const Icon = sectionIcons[section.group];
              const sectionFields = data.australian[section.group];
              return (
                <div
                  key={section.title}
                  className={`report-editor-section report-editor-au-section${sectionIndex % 3 === 0 ? ' report-editor-page-break-before' : ''}`}
                  style={{ ...sectionBox }}
                >
                  <SectionHeader icon={Icon} title={section.title} color={C} />
                  <AustralianFieldGrid
                    fields={section.fields.map(({ label, key }) => ({
                      label,
                      value: sectionFields[key] ?? 'Not Available',
                      onChange: (value) => setAustralianField(section.group, key, value),
                    }))}
                  />

                  {section.group === 'damageHistory' && (
                    <>
                      {renderRecordList('accidentRecords', 'Accident Records')}
                      {renderRecordList('damageRecords', 'Accident & Damage Record Timeline')}
                    </>
                  )}
                  {section.group === 'odometer' && renderRecordList('odometerHistory', 'Mileage History Timeline')}
                  {section.group === 'diagnostics' && renderRecordList('diagnosticFaultCodes', 'Diagnostic Fault Code Records')}
                  {section.group === 'recalls' && renderRecordList('recallRecords', 'Recall Campaign Records')}
                  {section.group === 'serviceHistory' && renderRecordList('serviceRecords', 'Service & Maintenance Timeline')}
                  {section.group === 'overallHealth' && renderRecordList('repairRecommendations', 'Repair & Maintenance Recommendations')}
                  {section.group === 'interior' && (
                    <div className="report-editor-au-tyres">
                      <SectionHeader icon={Gauge} title="Tyres, Wheels & Brakes Assessment" color={C} />
                      <div className="report-editor-au-tyres-grid">
                        {(['Front Left', 'Front Right', 'Rear Left', 'Rear Right', 'Spare'] as const).map((position) => (
                          <div key={position} className="report-editor-au-record">
                            <div className="report-editor-au-record-title">
                              <strong>{position} Tyre</strong>
                            </div>
                            <AustralianFieldGrid
                              fields={[
                                { label: 'Tread Depth (mm)', key: 'TreadDepthmm' },
                                { label: 'Tyre Condition', key: 'TyreCondition' },
                                { label: 'Tyre Brand', key: 'TyreBrand' },
                                { label: 'Tyre Size', key: 'TyreSize' },
                                { label: 'Manufacturing Date (if available)', key: 'ManufacturingDate' },
                              ].map(({ label, key }) => ({
                                label,
                                value: data.australian.tyres[position][key] ?? 'Not Available',
                                onChange: (value) => setTyreField(position, key, value),
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                      <SubHeader title="Wheels & Brake Components" color={C} />
                      <AustralianFieldGrid
                        fields={Object.entries(data.australian.tyres.general).map(([key, value]) => ({
                          label: key.replace(/([A-Z])/g, ' $1').trim(),
                          value,
                          onChange: (nextValue) => setTyreField('general', key, nextValue),
                        }))}
                      />
                    </div>
                  )}
                </div>
              );
            })}

          {/* ══ AUDITING SUMMARY ══ */}
          <div className="report-editor-section report-editor-page-break-before" style={{ ...sectionBox }}>
            <SectionHeader icon={CheckSquare} title="Auditing Summary & Conclusion" color={C} />

            <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 4, height: 42, background: `linear-gradient(180deg, ${brandTheme.light}, ${brandTheme.base})`, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.7 }}>
                  <strong>Vehicle Assessment Summary</strong> —{' '}
                  <E value={data.auditSummaryText} onChange={(v) => set('auditSummaryText', v)} multiline style={{ color: '#374151' }} />
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 14 }}>
                <span style={{ fontSize: 16, color: C }}>$</span>
                <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.7 }}>
                  <E value={data.marketValueSummary} onChange={(v) => set('marketValueSummary', v)} multiline style={{ color: '#374151' }} />
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
              <AlertCircle size={13} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 11, color: '#7a7a7a', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                <span style={{ fontWeight: 600 }}>Disclaimer: </span>
                <E value={data.disclaimerText} onChange={(v) => set('disclaimerText', v)} multiline style={{ color: '#7a7a7a' }} />
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 11, color: '#7a7a7a', margin: 0 }}>
                Email: <E value={data.email} onChange={(v) => set('email', v)} style={{ color: '#3b82f6', textDecoration: 'underline' }} /> &nbsp;|&nbsp; Website:{' '}
                <E value={data.website} onChange={(v) => set('website', v)} style={{ color: '#3b82f6', textDecoration: 'underline' }} />
              </p>
            </div>
          </div>

          {/* ══ FOOTER ══ */}
          <div className="report-editor-footer" style={{ padding: '18px 36px', background: brandTheme.footer, borderTop: `2px solid ${brandTheme.base}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ background: 'white', borderRadius: 12, padding: '6px 12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 60, minHeight: 42, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {report.logo_url
                ? <img src={report.logo_url} alt="Logo" style={{ maxHeight: 32, maxWidth: 80, objectFit: 'contain' }} />
                : <Car size={18} color={C} />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#7a7a7a' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2L7 1" stroke="#7a7a7a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </div>
              <E value={data.tagline} onChange={(v) => set('tagline', v)} style={{ color: '#7a7a7a' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, color: C }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${C}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2L7 1" stroke={C} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </div>
              <E value={data.securedBy} onChange={(v) => set('securedBy', v)} style={{ color: C }} />
            </div>
          </div>
          </div>

          <div className="report-editor-standard-pages">
            {standardPages.map(({ title, icon, fields }, pageIndex) => (
              <section key={title} className="report-editor-standard-page">
                <div className="report-editor-standard-page-top">
                  <strong>{report.brand?.name || 'Australian Vehicle Report'}</strong>
                  <span>{reportId} · {report.package_type} Report</span>
                </div>
                <SectionHeader icon={icon} title={title} color={C} />
                <AustralianFieldGrid fields={fields} />
                <div className="report-editor-standard-page-footer">
                  <span>Australian Vehicle Health &amp; History Report</span>
                  <span>Page {pageIndex + 1} of 8</span>
                </div>
              </section>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
