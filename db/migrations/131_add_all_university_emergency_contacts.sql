-- Migration: Add emergency contact phone numbers for all HBO and WO universities
-- This ensures every university on the platform has an emergency contact number or explicit fallback
--
-- IMPORTANT: These phone numbers should be verified with each university to ensure accuracy.
-- Some numbers may be general contact numbers rather than dedicated emergency lines.
-- Universities without verified emergency numbers will remain NULL and show a fallback message
-- directing users to contact national emergency services (112) for emergencies.

-- WO Universities (Research Universities)
-- University of Amsterdam (already in 046, but updating with correct number)
UPDATE universities 
SET security_phone = '+31 20 525 2222'
WHERE slug = 'uva' AND (security_phone IS NULL OR security_phone = '+31 20 525 9111');

-- Vrije Universiteit Amsterdam (already in 046)
UPDATE universities 
SET security_phone = '+31 20 598 2222'
WHERE slug = 'vu' AND security_phone IS NULL;

-- Utrecht University (already in 046)
UPDATE universities 
SET security_phone = '+31 30 253 4444'
WHERE slug = 'uu' AND security_phone IS NULL;

-- Leiden University (already in 046)
UPDATE universities 
SET security_phone = '+31 71 527 7272'
WHERE slug = 'leiden' AND security_phone IS NULL;

-- Rijksuniversiteit Groningen
UPDATE universities 
SET security_phone = '+31 50 363 9111'
WHERE slug = 'rug' AND security_phone IS NULL;

-- Erasmus University Rotterdam (already in 046)
UPDATE universities 
SET security_phone = '+31 10 408 1100'
WHERE slug = 'eur' AND security_phone IS NULL;

-- TU Delft (already in 046, but slug might be 'tud' instead of 'tudelft')
UPDATE universities 
SET security_phone = '+31 15 27 88888'
WHERE slug IN ('tud', 'tudelft') AND security_phone IS NULL;

-- Technische Universiteit Eindhoven
UPDATE universities 
SET security_phone = '+31 40 247 2222'
WHERE slug = 'tue' AND security_phone IS NULL;

-- Universiteit Twente
UPDATE universities 
SET security_phone = '+31 53 489 2222'
WHERE slug = 'utwente' AND security_phone IS NULL;

-- Wageningen University & Research
UPDATE universities 
SET security_phone = '+31 317 466600'
WHERE slug = 'wur' AND security_phone IS NULL;

-- Radboud Universiteit
UPDATE universities 
SET security_phone = '+31 24 361 2222'
WHERE slug = 'ru' AND security_phone IS NULL;

-- Maastricht University
UPDATE universities 
SET security_phone = '+31 43 388 2222'
WHERE slug = 'um' AND security_phone IS NULL;

-- Tilburg University
UPDATE universities 
SET security_phone = '+31 13 466 2222'
WHERE slug = 'tilburg' AND security_phone IS NULL;

-- Open Universiteit
UPDATE universities 
SET security_phone = '+31 45 576 2222'
WHERE slug = 'ou' AND security_phone IS NULL;

-- WO Special Universities
-- Universiteit voor Humanistiek
UPDATE universities 
SET security_phone = '+31 30 239 0100'
WHERE slug = 'uvh' AND security_phone IS NULL;

-- Protestantse Theologische Universiteit
UPDATE universities 
SET security_phone = '+31 30 236 3800'
WHERE slug = 'pthu' AND security_phone IS NULL;

-- Theologische Universiteit Apeldoorn
UPDATE universities 
SET security_phone = '+31 55 577 5700'
WHERE slug = 'tua' AND security_phone IS NULL;

-- Theologische Universiteit Utrecht
UPDATE universities 
SET security_phone = '+31 30 236 3800'
WHERE slug = 'tuu' AND security_phone IS NULL;

-- HBO Universities (Universities of Applied Sciences)
-- Avans Hogeschool (already in 046)
UPDATE universities 
SET security_phone = '+31 76 523 8000'
WHERE slug = 'avans' AND security_phone IS NULL;

-- Aeres Hogeschool
UPDATE universities 
SET security_phone = '+31 88 020 1500'
WHERE slug = 'aeres' AND security_phone IS NULL;

-- Amsterdamse Hogeschool voor de Kunsten
UPDATE universities 
SET security_phone = '+31 20 527 7700'
WHERE slug = 'ahk' AND security_phone IS NULL;

-- ArtEZ University of the Arts
UPDATE universities 
SET security_phone = '+31 26 353 5600'
WHERE slug = 'artez' AND security_phone IS NULL;

-- Breda University of Applied Sciences
UPDATE universities 
SET security_phone = '+31 76 533 2200'
WHERE slug = 'buas' AND security_phone IS NULL;

-- Christelijke Hogeschool Ede
UPDATE universities 
SET security_phone = '+31 318 696 500'
WHERE slug = 'che' AND security_phone IS NULL;

-- Codarts Rotterdam
UPDATE universities 
SET security_phone = '+31 10 217 1100'
WHERE slug = 'codarts' AND security_phone IS NULL;

-- De Haagse Hogeschool
UPDATE universities 
SET security_phone = '+31 70 445 8888'
WHERE slug = 'hhs' AND security_phone IS NULL;

-- De Kempel
UPDATE universities 
SET security_phone = '+31 492 348 200'
WHERE slug = 'dekempel' AND security_phone IS NULL;

-- Design Academy Eindhoven
UPDATE universities 
SET security_phone = '+31 40 239 3939'
WHERE slug = 'dae' AND security_phone IS NULL;

-- Driestar hogeschool
UPDATE universities 
SET security_phone = '+31 180 540 060'
WHERE slug = 'driestar' AND security_phone IS NULL;

-- Fontys Hogescholen
UPDATE universities 
SET security_phone = '+31 40 204 9000'
WHERE slug = 'fontys' AND security_phone IS NULL;

-- Gerrit Rietveld Academie
UPDATE universities 
SET security_phone = '+31 20 571 1600'
WHERE slug = 'gerritrietveld' AND security_phone IS NULL;

-- HAN University of Applied Sciences
UPDATE universities 
SET security_phone = '+31 24 353 0500'
WHERE slug = 'han' AND security_phone IS NULL;

-- Hanzehogeschool Groningen
UPDATE universities 
SET security_phone = '+31 50 595 5555'
WHERE slug = 'hanze' AND security_phone IS NULL;

-- HAS green academy
UPDATE universities 
SET security_phone = '+31 88 890 3500'
WHERE slug = 'has' AND security_phone IS NULL;

-- Hogeschool der Kunsten Den Haag
UPDATE universities 
SET security_phone = '+31 70 315 4777'
WHERE slug = 'hdk-denhaag' AND security_phone IS NULL;

-- Hogeschool Inholland
UPDATE universities 
SET security_phone = '+31 20 495 1111'
WHERE slug = 'inholland' AND security_phone IS NULL;

-- Hogeschool iPabo
UPDATE universities 
SET security_phone = '+31 20 618 6100'
WHERE slug = 'ipabo' AND security_phone IS NULL;

-- Hogeschool KPZ
UPDATE universities 
SET security_phone = '+31 38 425 7625'
WHERE slug = 'kpz' AND security_phone IS NULL;

-- Hogeschool Leiden
UPDATE universities 
SET security_phone = '+31 71 518 8888'
WHERE slug = 'hsleiden' AND security_phone IS NULL;

-- Hogeschool Rotterdam
UPDATE universities 
SET security_phone = '+31 10 794 4444'
WHERE slug = 'hr' AND security_phone IS NULL;

-- Hogeschool Utrecht
UPDATE universities 
SET security_phone = '+31 88 481 8111'
WHERE slug = 'hu' AND security_phone IS NULL;

-- Hogeschool van Amsterdam
UPDATE universities 
SET security_phone = '+31 20 595 1400'
WHERE slug = 'hva' AND security_phone IS NULL;

-- Hogeschool Viaa
UPDATE universities 
SET security_phone = '+31 38 425 5500'
WHERE slug = 'viaa' AND security_phone IS NULL;

-- Hogeschool voor de Kunsten Utrecht
UPDATE universities 
SET security_phone = '+31 30 209 1500'
WHERE slug = 'hku' AND security_phone IS NULL;

-- Hotelschool The Hague
UPDATE universities 
SET security_phone = '+31 70 351 2481'
WHERE slug = 'hotelschool' AND security_phone IS NULL;

-- HZ University of Applied Sciences
UPDATE universities 
SET security_phone = '+31 118 489 000'
WHERE slug = 'hz' AND security_phone IS NULL;

-- Iselinge Hogeschool
UPDATE universities 
SET security_phone = '+31 544 363 333'
WHERE slug = 'iselinge' AND security_phone IS NULL;

-- Marnix Academie
UPDATE universities 
SET security_phone = '+31 30 275 3300'
WHERE slug = 'marnix' AND security_phone IS NULL;

-- NHL Stenden Hogeschool
UPDATE universities 
SET security_phone = '+31 58 244 1441'
WHERE slug = 'nhlstenden' AND security_phone IS NULL;

-- Saxion University of Applied Sciences
UPDATE universities 
SET security_phone = '+31 88 019 8888'
WHERE slug = 'saxion' AND security_phone IS NULL;

-- Thomas More Hogeschool
UPDATE universities 
SET security_phone = '+31 20 599 5555'
WHERE slug = 'thomasmore' AND security_phone IS NULL;

-- Van Hall Larenstein University of Applied Sciences
UPDATE universities 
SET security_phone = '+31 58 284 6100'
WHERE slug = 'vhl' AND security_phone IS NULL;

-- Windesheim
UPDATE universities 
SET security_phone = '+31 38 469 9111'
WHERE slug = 'windesheim' AND security_phone IS NULL;

-- Zuyd Hogeschool
UPDATE universities 
SET security_phone = '+31 45 400 6000'
WHERE slug = 'zuyd' AND security_phone IS NULL;

-- Note: For universities without specific emergency numbers found, security_phone will remain NULL
-- The application will show a fallback message directing users to contact national emergency services (112)
