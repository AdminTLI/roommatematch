// Landlord Letter Generator for WWS Rent Check Results

import { WWSFormData, WWSResult } from './types'

/**
 * Generate a professional letter template for the landlord
 */
export function generateLandlordLetter(
  formData: WWSFormData,
  result: WWSResult
): string {
  const address = formData.address || '[Your Address]'
  const currentRent = formData.currentRent
    ? `€${formData.currentRent.toFixed(2)}`
    : '[Your Current Rent]'
  const maxRent = result.maxRent > 0
    ? `€${result.maxRent.toFixed(2)}`
    : 'market rate (liberalized sector)'
  const totalPoints = Math.round(result.points.totalPoints)

  const letter = `Dear Landlord,

Based on the Woningwaarderingsstelsel (WWS) point system, I have calculated the maximum legal basic rent [Kale Huur] for my accommodation at:

${address}

According to the WWS calculation:
- Total WWS Points: ${totalPoints} points
- Maximum Legal Basic Rent [Kale Huur]: ${maxRent}

I am currently paying ${currentRent} per month.

I would like to discuss adjusting the rent to comply with the legal limit as determined by the Woningwaarderingsstelsel (WWS) regulations.

This calculation is based on the official 2025 WWS standards, which take into account:
- Surface area [Oppervlakte]
- Energy label [Energieprestatie]
- Kitchen facilities [Keuken]
- Sanitary facilities [Sanitair]
- Outdoor space [Buitenruimte]
- WOZ value (where applicable)

I hope we can find a mutually agreeable solution. If you have any questions or would like to review the calculation, please let me know.

For reference, official rent assessments can be obtained through the Huurcommissie (Rent Tribunal) if needed.

Best regards,
[Your Name]

---
This letter was generated using the Domu Match WWS Rent Check Calculator.
This calculation is an estimate and should be used for negotiation purposes.
For a legally binding ruling, please contact the Huurcommissie or a legal expert.`

  return letter
}



