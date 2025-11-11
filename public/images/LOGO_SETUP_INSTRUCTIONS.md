# Logo and Favicon Setup Instructions

## ✅ Completed Setup

The codebase has been updated to support your logo and favicon. All components are now configured to use the logo image.

## 📁 Required Files

You need to add the following image files:

### 1. Logo Image
**Location**: `public/images/logo.png`
- **Recommended size**: 512x512px or larger
- **Format**: PNG with transparency
- **Description**: Your teal background logo with white house and two figures

### 2. Favicon Files
Place these in the `public/` directory:

#### `public/favicon.ico`
- Multi-size ICO file (16x16, 32x32, 48x48)
- You can generate this from your logo using an online tool like:
  - https://favicon.io/favicon-converter/
  - https://realfavicongenerator.net/

#### `public/icon.png` (180x180px)
- Apple touch icon for iOS devices
- Square format, 180x180px PNG

#### `public/icon-192.png` (192x192px)
- Android icon for PWA
- Square format, 192x192px PNG

#### `public/icon-512.png` (512x512px)
- Android icon for PWA (high-res)
- Square format, 512x512px PNG

## 🎨 Logo Specifications

Based on your logo design:
- **Background Color**: Teal (#0F766E or similar)
- **Main Elements**: White house outline with two figures inside
- **Style**: Minimalist, clean design
- **Format**: PNG with transparency preferred, or SVG

## 🚀 Quick Setup Steps

1. **Prepare your logo image**
   - Export as PNG (512x512px or larger)
   - Ensure transparency if needed
   - Save as `logo.png`

2. **Generate favicon files**
   - Use your logo.png as the source
   - Generate favicon.ico (multi-size)
   - Generate icon sizes: 180x180, 192x192, 512x512

3. **Place files in the correct locations**
   ```
   public/
   ├── favicon.ico
   ├── icon.png (180x180)
   ├── icon-192.png
   ├── icon-512.png
   └── images/
       └── logo.png
   ```

4. **Test locally**
   ```bash
   npm run dev
   ```
   - Check that the logo appears in the navbar
   - Verify favicon shows in browser tab
   - Test on mobile devices

5. **Deploy to Vercel**
   - Commit the image files
   - Push to GitHub
   - Vercel will automatically deploy

## 📝 Where Logo is Used

The logo appears in:
- ✅ Navigation bars (all headers)
- ✅ App header (logged-in users)
- ✅ Marketing header
- ✅ Universities header
- ✅ Footer (can be added if needed)
- ✅ Browser favicon
- ✅ PWA app icons
- ✅ Email templates (can be updated)
- ✅ PDF reports (can be updated)

## 🔧 Customization

If you want to adjust logo sizing, edit these files:
- `components/site/navbar.tsx` - Main navbar logo
- `app/(components)/app-header.tsx` - App header logo
- `app/(marketing)/components/marketing-header.tsx` - Marketing header
- `app/learn/components/universities-header.tsx` - Universities header

Logo sizes are controlled by the `h-8 w-8` classes (32px) or `h-10 w-10` (40px) on desktop.

## ⚠️ Important Notes

1. **Image Optimization**: The code uses Next.js Image component for automatic optimization
2. **Fallback**: If the logo image fails to load, text "Domu Match" will be shown
3. **Format**: PNG is recommended, but SVG can also work if you prefer vector
4. **Accessibility**: All logo images include proper alt text for screen readers

## 🎯 Next Steps

1. Add your logo.png file to `public/images/`
2. Generate and add favicon files to `public/`
3. Test locally to ensure everything displays correctly
4. Commit and push to trigger Vercel deployment
5. Verify the logo appears correctly on the live site

## 📚 Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Favicon Generator](https://favicon.io/)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [PWA Manifest Guide](https://web.dev/add-manifest/)

---

**Note**: Until you add the actual image files, the logo will not display. The text "Domu Match" will be shown as a fallback.

