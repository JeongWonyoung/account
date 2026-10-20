/** @type {import('tailwindcss').Config} */
export default {
  content: { relative: true, files: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'] },
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"', '"Apple SD Gothic Neo"', '"Malgun Gothic"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        /* workbench shell — themed tokens */
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        mute: 'var(--mute)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'on-accent': 'var(--on-accent)',
        ok: 'var(--ok)',
        'ok-soft': 'var(--ok-soft)',
        warn: 'var(--warn)',
        'warn-soft': 'var(--warn-soft)',
        /* toonation product — fixed light, mirrors 설계서 palette */
        brand: { DEFAULT: '#375FF4', 50: '#EEF2FE', 600: '#2849D6' },
        p: {
          page: '#F4F6FA',
          ink: '#1A1D26',
          mute: '#5F6577',
          faint: '#9AA0AE',
          line: '#DDE1E9',
          soft: '#F2F4F8',
          danger: '#FF5050',
        },
      },
    },
  },
  plugins: [],
}
