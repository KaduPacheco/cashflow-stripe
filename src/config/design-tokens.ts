
// Design Tokens - Cash Flow Fintech Theme
export const DESIGN_TOKENS = {
  colors: {
    light: {
      background: '#F9FAFB',
      onBackground: '#111827',
      surface: '#FFFFFF',
      onSurface: '#111827',
      primary: '#0F4C81',
      onPrimary: '#FFFFFF',
      secondary: '#006D5B',
      onSecondary: '#FFFFFF',
      error: '#DC2626',
      onError: '#FFFFFF',
      success: '#16A34A',
      onSuccess: '#FFFFFF',
      warning: '#CA8A04',
      onWarning: '#FFFFFF',
      border: '#E5E7EB',
      muted: '#9CA3AF',
      accent: '#0F4C81',
      card: '#FFFFFF',
      onCard: '#111827'
    },
    dark: {
      background: '#121212',
      onBackground: '#E5E7EB',
      surface: '#1E1E1E',
      onSurface: '#E5E7EB',
      primary: '#0F4C81',
      onPrimary: '#FFFFFF',
      secondary: '#006D5B',
      onSecondary: '#FFFFFF',
      error: '#DC2626',
      onError: '#FFFFFF',
      success: '#16A34A',
      onSuccess: '#FFFFFF',
      warning: '#CA8A04',
      onWarning: '#FFFFFF',
      border: '#2C2C2C',
      muted: '#9CA3AF',
      accent: '#0F4C81',
      card: '#1E1E1E',
      onCard: '#E5E7EB'
    }
  },
  typography: {
    fonts: ['Inter', 'Open Sans', 'Roboto', 'system-ui', 'sans-serif']
  },
  spacing: {
    borderRadius: {
      card: '1rem', // rounded-2xl
      button: '1rem' // rounded-2xl
    }
  },
  animations: {
    transition: 'all 0.2s ease-in-out',
    hover: {
      scale: 'scale(1.02)',
      shadow: 'shadow-fintech-lg'
    }
  }
} as const

export type DesignTokens = typeof DESIGN_TOKENS
