/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // DESIGN.md Artisanal Logic Warm Minimalist Color Palette
        cream: {
          DEFAULT: '#FDFCF0',
          dim: '#dbdbcf',
          bright: '#fbfaee',
          container: '#efeee3',
          highest: '#e4e3d7',
        },
        charcoal: {
          DEFAULT: '#2D2D2D',
          dark: '#1b1c15',
          variant: '#444748',
          inverse: '#303129',
        },
        terracotta: {
          DEFAULT: '#E2725B',
          dark: '#9f402d',
          container: '#fd876f',
        },
        sage: {
          DEFAULT: '#8A9A5B',
          dark: '#253100',
          container: '#d9eaa3',
        },
        border: 'rgba(45, 45, 45, 0.1)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      spacing: {
        'section-gap': '120px',
        'gutter': '24px',
        'margin-mobile': '20px',
      },
      maxWidth: {
        container: '1120px',
      },
      boxShadow: {
        ambient: '0 10px 30px rgba(45, 45, 45, 0.05)',
      },
    },
  },
  plugins: [],
}
