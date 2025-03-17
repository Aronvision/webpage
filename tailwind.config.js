/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-primary-500',
    'text-primary-500',
    'bg-secondary-500',
    'text-secondary-500',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1440px',
      },
    },
    screens: {
      'mobile': '320px',
      'tablet': '768px',
      'desktop': '1024px',
      'wide': '1440px',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        primary: {
          100: 'hsl(var(--primary-100))',
          300: 'hsl(var(--primary-300))',
          500: 'hsl(var(--primary-500))',
          700: 'hsl(var(--primary-700))',
          900: 'hsl(var(--primary-900))',
          DEFAULT: 'hsl(var(--primary-500))',
          foreground: 'hsl(var(--foreground))',
        },
        
        secondary: {
          100: 'hsl(var(--secondary-100))',
          500: 'hsl(var(--secondary-500))',
          700: 'hsl(var(--secondary-700))',
          DEFAULT: 'hsl(var(--secondary-500))',
          foreground: 'hsl(var(--foreground))',
        },
        
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--foreground))',
        },
        
        neutral: {
          100: 'hsl(var(--neutral-100))',
          300: 'hsl(var(--neutral-300))',
          500: 'hsl(var(--neutral-500))',
          700: 'hsl(var(--neutral-700))',
          900: 'hsl(var(--neutral-900))',
          DEFAULT: 'hsl(var(--neutral-500))',
        },
        
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}; 