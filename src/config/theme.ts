
import { DESIGN_TOKENS } from './design-tokens'

// Theme Configuration - Aplicando Design Tokens
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: DESIGN_TOKENS.colors.light.primary,
    PRIMARY_FOREGROUND: DESIGN_TOKENS.colors.light.onPrimary,
    SECONDARY: DESIGN_TOKENS.colors.light.secondary,
    SECONDARY_FOREGROUND: DESIGN_TOKENS.colors.light.onSecondary,
    BACKGROUND: DESIGN_TOKENS.colors.light.background,
    FOREGROUND: DESIGN_TOKENS.colors.light.onBackground,
    MUTED: DESIGN_TOKENS.colors.light.muted,
    MUTED_FOREGROUND: DESIGN_TOKENS.colors.light.muted,
    BORDER: DESIGN_TOKENS.colors.light.border,
    DESTRUCTIVE: DESIGN_TOKENS.colors.light.error,
    DESTRUCTIVE_FOREGROUND: DESIGN_TOKENS.colors.light.onError,
    SUCCESS: DESIGN_TOKENS.colors.light.success,
    SUCCESS_FOREGROUND: DESIGN_TOKENS.colors.light.onSuccess,
    WARNING: DESIGN_TOKENS.colors.light.warning,
    WARNING_FOREGROUND: DESIGN_TOKENS.colors.light.onWarning,
  },
  ANIMATIONS: {
    FADE_IN: 'fade-in 0.3s ease-in-out',
    SLIDE_UP: 'slide-up 0.3s ease-out',
    SCALE: 'scale 0.2s ease-in-out',
    TRANSITION: DESIGN_TOKENS.animations.transition,
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
  },
  TYPOGRAPHY: {
    FONTS: DESIGN_TOKENS.typography.fonts,
  },
  SPACING: {
    BORDER_RADIUS: DESIGN_TOKENS.spacing.borderRadius,
  }
} as const

// CSS Variable Names
export const CSS_VARIABLES = {
  PRIMARY: '--primary',
  BACKGROUND: '--background',
  FOREGROUND: '--foreground',
  TITLE_COLOR: '--title-color',
  RADIUS: '--radius',
} as const
