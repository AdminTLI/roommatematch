# Logo Files

This directory contains the logo and icon files for Domu Match.

## Required Files

Please place the following files in this directory:

1. **logo.png** - Main logo image (recommended: 512x512px or larger, PNG with transparency)
2. **logo.svg** - Vector version of the logo (optional but recommended for scalability)

## Favicon Files

Favicon files should be placed in the `public` directory:

1. **favicon.ico** - Main favicon (16x16, 32x32, 48x48 sizes)
2. **icon.png** - Apple touch icon (180x180px)
3. **icon-192.png** - Android icon (192x192px)
4. **icon-512.png** - Android icon (512x512px)

## Logo Specifications

Based on your logo design (teal background with white house and figures):

- **Format**: PNG with transparency or SVG
- **Background**: Teal (#0F766E or similar)
- **Main Element**: White house outline with two figures inside
- **Recommended Sizes**:
  - Logo: 512x512px (for high-resolution displays)
  - Favicon: Multiple sizes (16x16, 32x32, 48x48, 180x180)
  - Icon: 192x192, 512x512 (for PWA)

## Usage

The logo is referenced in:
- `config/brand.json` - Logo path configuration
- Component headers and navbars
- Email templates
- PDF generation
- Favicon metadata in `app/layout.tsx`

