export const theme = {
    colors: {
        background: '#F3F6F9',
        surface: '#FFFFFF',
        text: '#10202F',
        textMuted: '#5B6B7B',
        border: '#E8EDF2',
        track: '#E4E9EE',
    },
    risk: {
        bajo: { main: '#2F9E6B', soft: '#DDF3E8', ink: '#124A33', label: 'Riesgo bajo' },
        medio: { main: '#D9961A', soft: '#FCEFC9', ink: '#5C3F06', label: 'Riesgo medio' },
        alto: { main: '#D64545', soft: '#FBE1DD', ink: '#5C1A17', label: 'Riesgo alto' },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radius: { md: 12, lg: 20, sheet: 28 },
    font: {
        regular: 'Manrope_400Regular',
        semibold: 'Manrope_600SemiBold',
        bold: 'Manrope_800ExtraBold',
    },
} as const;