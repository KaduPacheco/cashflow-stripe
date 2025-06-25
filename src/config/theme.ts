
// Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: 'hsl(var(--primary))',
    PRIMARY_FOREGROUND: 'hsl(var(--primary-foreground))',
    SECONDARY: 'hsl(var(--secondary))',
    SECONDARY_FOREGROUND: 'hsl(var(--secondary-foreground))',
    BACKGROUND: 'hsl(var(--background))',
    FOREGROUND: 'hsl(var(--foreground))',
    MUTED: 'hsl(var(--muted))',
    MUTED_FOREGROUND: 'hsl(var(--muted-foreground))',
    BORDER: 'hsl(var(--border))',
    DESTRUCTIVE: 'hsl(var(--destructive))',
    DESTRUCTIVE_FOREGROUND: 'hsl(var(--destructive-foreground))',
  },
  ANIMATIONS: {
    FADE_IN: 'fade-in 0.3s ease-in-out',
    SLIDE_UP: 'slide-up 0.3s ease-out',
    SCALE: 'scale 0.2s ease-in-out',
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
  },
} as const

// CSS Variable Names
export const CSS_VARIABLES = {
  PRIMARY: '--primary',
  BACKGROUND: '--background',
  FOREGROUND: '--foreground',
  TITLE_COLOR: '--title-color',
  RADIUS: '--radius',
} as const
