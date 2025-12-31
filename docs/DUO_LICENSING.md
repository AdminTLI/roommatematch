# DUO Licensing Compliance
## Dienst Uitvoering Onderwijs (DUO) Data Usage

**Date:** January 2025  
**Version:** 1.0

This document outlines compliance with DUO (Dutch Ministry of Education) data licensing requirements.

## Data Source

### Primary Source: DUO "Overzicht Erkenningen ho"

**Dataset:** Overzicht Erkenningen hoger onderwijs  
**Provider:** Dienst Uitvoering Onderwijs (DUO)  
**Update Frequency:** Daily  
**Format:** CSV  
**License:** Open Data (with reuse restrictions)

**URL:** https://onderwijsdata.duo.nl/dataset/bb07cc6e-00fe-4100-9528-a0c5fd27d2fb

### Secondary Source: Studiekeuzedatabase

**Dataset:** Studiekeuzedatabase (SKDB)  
**Provider:** Studiekeuzedatabase (CROHO/RIO-backed)  
**API:** REST OData API  
**License:** Open Data (with attribution requirements)

## Data Usage

### What We Use

1. **Institution Data:**
   - BRIN codes (institution identifiers)
   - Institution names
   - Institution types (WO, HBO)

2. **Program Data:**
   - CROHO codes (program identifiers)
   - Program names (Dutch and English)
   - Degree levels (Bachelor, Master, Pre-Master)
   - Language codes
   - Faculty information

### How We Use It

1. **University Verification:**
   - Verify user university affiliation
   - Match users to correct institution

2. **Program Matching:**
   - Match users by academic program
   - Filter matches by program compatibility
   - Display program information to users

3. **Coverage Monitoring:**
   - Track program coverage per university
   - Identify missing programs
   - Monitor data completeness

## Licensing Compliance

### DUO Open Data License

**Requirements:**
1. ✅ **Attribution:** DUO acknowledged as data source
2. ✅ **No Redistribution:** DUO data not redistributed in raw form
3. ✅ **Purpose Limitation:** Data used only for platform functionality
4. ✅ **No Commercial Resale:** Data not sold or licensed to third parties

### Compliance Measures

1. **Attribution:**
   - DUO acknowledged in Terms of Service
   - Data source documented in Privacy Policy
   - Attribution maintained in code comments

2. **Data Processing:**
   - DUO data processed and transformed (not raw redistribution)
   - Only necessary fields extracted
   - Data enriched with user input (not pure DUO data)

3. **User-Facing:**
   - Program names displayed to users (transformed data)
   - No raw DUO dataset exposed
   - Attribution visible in relevant UI sections

## Terms of Service Update

**Required Addition:**

> "Program and university data is sourced from Dienst Uitvoering Onderwijs (DUO) and Studiekeuzedatabase. DUO data is used in accordance with DUO Open Data licensing terms. We acknowledge DUO as the data source and comply with all reuse restrictions."

## Data Updates

### Update Process

1. **Daily Updates:**
   - DUO CSV downloaded daily (if available)
   - Program data synchronized
   - Changes logged

2. **Manual Updates:**
   - Manual import scripts available
   - Data validation before import
   - Error handling and logging

### Data Quality

- **Validation:** Program data validated against schema
- **Completeness:** Coverage monitoring ensures data completeness
- **Accuracy:** Regular reconciliation with source data

## Restrictions

### What We Don't Do

1. ❌ **Redistribute Raw Data:** DUO CSV not shared or redistributed
2. ❌ **Commercial Resale:** DUO data not sold or licensed
3. ❌ **Modify Attribution:** DUO always credited as source
4. ❌ **Extract BSN:** No citizen service numbers processed

### What We Do

1. ✅ **Transform Data:** Process and enrich DUO data
2. ✅ **Display to Users:** Show program information in UI
3. ✅ **Match Users:** Use data for matching functionality
4. ✅ **Maintain Attribution:** Always credit DUO

## Audit Trail

### Documentation

- **Data Source:** DUO "Overzicht Erkenningen ho"
- **Last Updated:** [Date of last sync]
- **Update Frequency:** Daily
- **Data Fields Used:** Institution codes, program codes, program names, degree levels

### Logging

- Data import logs maintained
- Update frequency tracked
- Errors logged and monitored
- Coverage metrics recorded

## Contact

For questions about DUO data usage:
- **Technical:** info@domumatch.com
- **Legal:** info@domumatch.com
- **DUO Contact:** [DUO contact information]

## References

- [DUO Open Data Portal](https://onderwijsdata.duo.nl/)
- [Studiekeuzedatabase](https://www.studiekeuzedatabase.nl/)
- [DUO Data License Terms](https://onderwijsdata.duo.nl/terms)

**Last Updated:** January 2025

