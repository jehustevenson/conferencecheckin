module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)', /* slate-200 / slate-600 */
        input: 'var(--color-input)', /* slate-200 / slate-600 */
        ring: 'var(--color-ring)', /* blue-800 / blue-500 */
        background: 'var(--color-background)', /* slate-50 / slate-900 */
        foreground: 'var(--color-foreground)', /* slate-900 / slate-100 */
        primary: {
          DEFAULT: 'var(--color-primary)', /* blue-800 / blue-500 */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* slate-900 / slate-800 */
          foreground: 'var(--color-secondary-foreground)', /* slate-50 / slate-100 */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* red-600 / red-500 */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* slate-100 / slate-700 */
          foreground: 'var(--color-muted-foreground)', /* gray-500 / slate-400 */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* amber-500 / amber-400 */
          foreground: 'var(--color-accent-foreground)', /* gray-800 */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* white / slate-800 */
          foreground: 'var(--color-popover-foreground)', /* slate-900 / slate-100 */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* white / slate-800 */
          foreground: 'var(--color-card-foreground)', /* gray-700 / slate-200 */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* emerald-600 / emerald-500 */
          foreground: 'var(--color-success-foreground)', /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* amber-600 / amber-500 */
          foreground: 'var(--color-warning-foreground)', /* white */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* red-600 / red-500 */
          foreground: 'var(--color-error-foreground)', /* white */
        },
      },
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        caption: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h5': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
        xl: '16px',
        '2xl': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        'measure': '70ch',
      },
      zIndex: {
        '100': '100',
        '200': '200',
        '300': '300',
        '400': '400',
        '999': '999',
        '1000': '1000',
        '1001': '1001',
        '1100': '1100',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      keyframes: {
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        slideDown: 'slideDown 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}