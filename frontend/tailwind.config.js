/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // Deep Navy custom palette for dark theme
        navy: {
          950: '#060a14', // Ultra deep background
          900: '#0a1020', // Main dark surface
          850: '#0e172e', // Card background
          800: '#13203e', // Hover/elevated surface
          700: '#1d2e56', // Borders / subtle dividers
          600: '#2a4277',
          500: '#3b5c9e',
          400: '#5c7ec4',
          300: '#8ba6e0',
          200: '#bfd0f3',
          100: '#e1e9fa',
          50: '#f1f5fd',
        },
        // Accent Teal / Cyan / Electric Blue
        accent: {
          teal: '#14b8a6',
          cyan: '#06b6d4',
          sky: '#0284c7',
          blue: '#3b82f6',
          glow: '#38bdf8',
        },
        // Semantic Forensic Verdict Colors
        verdict: {
          authentic: '#10B981',   // Emerald / Green (Authentic 0-25%)
          'authentic-bg': 'rgba(16, 185, 129, 0.12)',
          'authentic-border': 'rgba(16, 185, 129, 0.35)',
          amber: '#F59E0B',       // Amber / Suspicious (26-69%)
          'amber-bg': 'rgba(245, 158, 11, 0.12)',
          'amber-border': 'rgba(245, 158, 11, 0.35)',
          deepfake: '#EF4444',    // Red / High Risk AI-Generated (70-100%)
          'deepfake-bg': 'rgba(239, 68, 68, 0.12)',
          'deepfake-border': 'rgba(239, 68, 68, 0.35)',
        },
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
        'grid-pattern-light': 'linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.35)',
        'glow-authentic': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-deepfake': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-line': 'scanLine 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(0%)', opacity: '0.8' },
          '50%': { transform: 'translateY(100%)', opacity: '0.4' },
          '100%': { transform: 'translateY(0%)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
