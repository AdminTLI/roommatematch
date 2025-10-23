/**
 * DUO HO Opleidingsoverzicht data processing
 * 
 * Source: DUO Open Onderwijsdata "HO Opleidingsoverzicht" CSV
 * Update frequency: Daily
 * Documentation: DUO column specification PDF
 * 
 * This module parses programme data from DUO's official higher education
 * programme overview, which is specifically designed for programme catalogue use.
 */

import { parse } from 'csv-parse/sync';
import type { Programme, DegreeLevel } from '@/types/programme';

type HoRow = {
  INSTELLINGSCODE: string;      // BRIN-like code
  INSTELLINGSNAAM: string;      // University/Hogeschool
  OPLEIDINGSEENHEIDCODE: string;// RIO id (stable)
  OPLEIDINGSEENHEID_NAAM: string;
  OPLEIDINGSEENHEID_INTERNATIONALE_NAAM?: string;
  GRAAD?: string;                // 'Bachelor', 'Master', (pre-masters usually blank)
  NIVEAU?: string;               // e.g. 'WO-BA','WO-MA','HBO-BA','HBO-MA'
  VORM?: string;                 // VOLTIJD/DEELTIJD/DUAAL
  STATUS?: string;               // e.g., 'actueel','toekomstig'
  DATUM_START?: string;          // ISO
  DATUM_EIND?: string;           // ISO (if planned end)
};

const ALLOWED = new Set(['WO-BA','WO-MA','HBO-BA','HBO-MA']); // we exclude AD/post-initieel here

function toLevel(r: HoRow): DegreeLevel | null {
  const n = (r.NIVEAU || '').toUpperCase();
  if (n.startsWith('WO-BA') || n.startsWith('HBO-BA')) return 'bachelor';
  if (n.startsWith('WO-MA') || n.startsWith('HBO-MA')) {
    // Heuristic: detect pre-masters (schakel) in the name and/or missing degree
    const name = (r.OPLEIDINGSEENHEID_NAAM || '').toLowerCase();
    const pre = /(pre-?master|schakel)/.test(name) && (!r.GRAAD || !/master/i.test(r.GRAAD));
    return pre ? 'premaster' : 'master';
  }
  // If level not in ALLOWED but name hints pre-master, still keep as premaster
  const name = (r.OPLEIDINGSEENHEID_NAAM || '').toLowerCase();
  if (/(pre-?master|schakel)/.test(name)) return 'premaster';
  return null;
}

export function mapModes(v?: string): ('fulltime'|'parttime'|'dual')[]|undefined {
  if (!v) return;
  const s = v.toUpperCase();
  const out: ('fulltime'|'parttime'|'dual')[] = [];
  if (s.includes('VOLTIJD')) out.push('fulltime');
  if (s.includes('DEELTIJD')) out.push('parttime');
  if (s.includes('DUAAL'))   out.push('dual');
  return out.length ? out : undefined;
}

export function parseHoOpleidingsoverzicht(
  csv: string, 
  instCode: string, 
  sector: 'wo'|'wo_special'|'hbo'
): Record<'bachelor'|'premaster'|'master', Programme[]> {
  const rows = parse(csv, { columns: true, skip_empty_lines: true }) as HoRow[];
  const mine = rows.filter(r => (r.INSTELLINGSCODE || '').toUpperCase() === (instCode || '').toUpperCase());
  const out = { bachelor: [] as Programme[], premaster: [] as Programme[], master: [] as Programme[] };

  for (const r of mine) {
    const level = toLevel(r);
    if (!level) continue;
    const p: Programme = {
      id: r.OPLEIDINGSEENHEIDCODE,
      name: r.OPLEIDINGSEENHEID_NAAM,
      nameEn: r.OPLEIDINGSEENHEID_INTERNATIONALE_NAAM || undefined,
      level,
      sector,
      modes: mapModes(r.VORM),
      externalRefs: { rioCode: r.OPLEIDINGSEENHEIDCODE, instCode: r.INSTELLINGSCODE }
    };
    out[level].push(p);
  }

  // sort for UX
  (['bachelor','premaster','master'] as const).forEach(k => out[k].sort((a,b)=>a.name.localeCompare(b.name)));
  return out;
}
