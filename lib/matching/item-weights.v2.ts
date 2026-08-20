/**
 * v2 item-weight configuration.
 *
 * ITEM_WEIGHTS: weight of each question within its module (values for a module sum to 1.0).
 * Hard-gate items (M5_Q17, M8_Q14, M8_Q19, M8_Q11) have weight 0 — they do not contribute
 * to the dimension score; they are checked separately by check_hard_constraints_v2.
 *
 * MODULE_WEIGHTS: relative weight of each scoring module in the harmony score.
 * M1 / logistics-context feeds the context score (25%), not harmony.
 */

export const ITEM_WEIGHTS: Record<string, number> = {
  // ── M1 logistics-context (feeds context score, not harmony) ──────────────
  'M5_Q17': 0,     // hard gate: no smoking
  'M8_Q14': 0,     // hard gate: pets
  'M8_Q19': 0,     // hard gate: BRP
  'M8_Q11': 0,     // hard gate: no Airbnb
  'M1_Q10': 0.18,  // cost-split approach
  'M1_Q20': 0.16,  // rule strictness
  'M6_Q7':  0.14,  // escalation stance
  'M8_Q23': 0.14,  // stay length
  'M8_Q20': 0.12,  // move-in flexibility
  'M8_Q25': 0.10,  // docs language
  'M8_Q24': 0.08,  // roommate agreement
  'M8_Q12': 0.08,  // insurance

  // ── M2 environment-rhythms (24% of harmony) ──────────────────────────────
  'M2_Q1':  0.16,  // sleep chronotype
  'M2_Q13': 0.16,  // quiet hours (weekday)
  'M3_Q2':  0.12,  // noise sensitivity
  'M3_Q4':  0.10,  // volume preference
  'M2_Q6':  0.10,  // light/noise sensitivity
  'M2_Q19': 0.09,  // tolerance for late-night noise
  'M1_Q6':  0.08,  // overall home vibe
  'M7_Q2':  0.07,  // alone-time need
  'M2_Q15': 0.06,  // weekend quiet-hour end time
  'M3_Q12': 0.03,  // temperature preference
  'M3_Q18': 0.02,  // lighting preference
  'M3_Q25': 0.01,  // sensory adaptability

  // ── M3 cleanliness-operations (28% of harmony) ───────────────────────────
  'M4_Q1':  0.18,  // cleanliness standard
  'M4_Q4':  0.14,  // dish washing timing
  'M4_Q12': 0.14,  // proactive cleaning
  'M4_Q14': 0.10,  // chore schedule acceptance
  'M4_Q7':  0.08,  // communal kitchen preference
  'M4_Q25': 0.08,  // deep-clean willingness
  'M4_Q20': 0.06,  // bathroom toiletries privacy
  'M8_Q5':  0.06,  // small-fix initiative
  'M4_Q24': 0.05,  // cleaning fund preference
  'M8_Q2':  0.05,  // expenses app acceptance
  'M7_Q9':  0.03,  // shared tools
  'M8_Q7':  0.03,  // sustainability practices

  // ── M4 communication-resolution (24% of harmony) ─────────────────────────
  'M6_Q9':  0.16,  // communication style (direct/indirect)
  'M1_Q23': 0.14,  // conflict resolution approach
  'M6_Q1':  0.12,  // issue handling channel
  'M6_Q8':  0.12,  // banter/sarcasm tolerance
  'M1_Q19': 0.10,  // cultural adaptability
  'M1_Q18': 0.08,  // guest boundary-setting
  'M5_Q12': 0.08,  // preferred common language
  'M6_Q15': 0.06,  // door etiquette
  'M6_Q16': 0.05,  // chat response speed
  'M5_Q14': 0.04,  // language-mix comfort
  'M6_Q11': 0.03,  // house rules app acceptance
  'M6_Q21': 0.02,  // anonymous feedback comfort

  // ── M5 social-spaces (24% of harmony) ────────────────────────────────────
  'M5_Q1':  0.16,  // guest frequency
  'M5_Q5':  0.16,  // overnight guests
  'M5_Q8':  0.14,  // partner stay frequency
  'M5_Q2':  0.10,  // guest notice period
  'M1_Q13': 0.09,  // social energy at home
  'M5_Q11': 0.09,  // shared space during gatherings
  'M5_Q18': 0.08,  // alcohol in common areas
  'M7_Q3':  0.06,  // co-studying in common areas
  'M7_Q6':  0.04,  // item lending
  'M7_Q11': 0.03,  // photo/video comfort
  'M7_Q17': 0.03,  // decor decision process
  'M7_Q19': 0.02,  // parcel handling
}

/** Weight of each module in the harmony score. M1 (logistics-context) is excluded — it feeds context. */
export const MODULE_WEIGHTS: Record<string, number> = {
  'environment-rhythms':     0.24,  // M2
  'cleanliness-operations':  0.28,  // M3
  'communication-resolution':0.24,  // M4
  'social-spaces':           0.24,  // M5
}

/** Section key → module label (for display and analytics). */
export const MODULE_LABELS: Record<string, string> = {
  'logistics-context':       'Logistics',
  'environment-rhythms':     'Environment',
  'cleanliness-operations':  'Cleanliness',
  'communication-resolution':'Communication',
  'social-spaces':           'Social Life',
}

/** Platform hard-gate item IDs (v2). */
export const HARD_GATE_IDS = ['M5_Q17', 'M8_Q14', 'M8_Q19', 'M8_Q11'] as const

export type HardGateId = (typeof HARD_GATE_IDS)[number]

/** Human-readable gate labels for the warning banner. */
export const GATE_LABELS: Record<HardGateId, string> = {
  'M5_Q17': 'No smoking indoors',
  'M8_Q14': 'Pet preference',
  'M8_Q19': 'BRP registration',
  'M8_Q11': 'No Airbnb guests',
}
