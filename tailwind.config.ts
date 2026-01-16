import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Semantic color tokens
        'bg-body': "hsl(var(--bg-body))",
        'bg-surface': "hsl(var(--bg-surface))",
        'bg-surface-alt': "hsl(var(--bg-surface-alt))",
        'border-subtle': "hsl(var(--border-subtle))",
        'text-primary': "hsl(var(--text-primary))",
        'text-secondary': "hsl(var(--text-secondary))",
        'text-muted': "hsl(var(--text-muted))",
        'semantic-accent': "hsl(var(--accent))",
        'semantic-accent-hover': "hsl(var(--accent-hover))",
        'semantic-accent-soft': "hsl(var(--accent-soft))",
        'semantic-danger': "hsl(var(--danger))",
        'semantic-warning': "hsl(var(--warning))",
        'semantic-success': "hsl(var(--success))",
        // Chat-specific semantic color tokens
        'chat-bg-primary': "hsl(var(--chat-bg-primary))",
        'chat-bg-secondary': "hsl(var(--chat-bg-secondary))",
        'chat-surface': "hsl(var(--chat-surface))",
        'chat-surface-sent': "hsl(var(--chat-surface-sent))",
        'chat-text-primary': "hsl(var(--chat-text-primary))",
        'chat-text-secondary': "hsl(var(--chat-text-secondary))",
        'chat-border': "hsl(var(--chat-border))",
        'chat-online': "hsl(var(--chat-online))",
        brand: {
          primary: '#7a3bb6',        // Purple
          primaryHover: '#6a32a0',   // Darker purple
          accent: '#06B6D4',         // Cyan 500
          surface: '#F8FAFC',        // Section tint
          text: '#0F172A',           // Slate 900
          muted: '#475569',          // Slate 600
          border: '#E2E8F0'          // Slate 200
        },
        // App shell tokens used across dashboard components
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1F2937',
          900: '#0F172A',
        },
        surface: {
          0: '#FFFFFF',
          1: '#F8FAFC',
          2: '#F1F5F9',
          3: '#E2E8F0',
        },
        line: '#E5E7EB',
        dashboard: '#F6F7FB',
        // Scales used by badges and buttons
        'brand-600': '#7a3bb6',
        'brand-700': '#6a32a0',
        'accent-100': '#CFFAFE',
        'accent-200': '#A5F3FC',
        'accent-600': '#0891B2',
        'accent-700': '#0E7490',
        'mint-100': '#DCFCE7',
        'mint-200': '#BBF7D0',
        'mint-600': '#16A34A',
        'mint-700': '#15803D',
        // Keep existing shadcn colors for compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Rent Calculator specific colors
        rent: {
          navy: '#0A0E1A',
          orange: '#FF921C',
          pink: '#F472B6',
        },
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(15,23,42,.06),0 1px 1px rgba(15,23,42,.04)',
        'elev-2': '0 10px 20px rgba(15,23,42,.05),0 4px 8px rgba(15,23,42,.04)'
      },
      borderRadius: { 
        '2xl': '1rem' 
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        // Mobile-first responsive typography
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        // Responsive headings
        'h1-mobile': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'h1-desktop': ['3.75rem', { lineHeight: '1', fontWeight: '700' }],
        'h2-mobile': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'h2-desktop': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '600' }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-gentle": "bounce-gentle 0.6s ease-out",
        "slide-out-left": "slide-out-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-out-right": "slide-out-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;