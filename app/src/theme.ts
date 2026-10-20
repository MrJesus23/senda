export const theme = {
    colors: {
        background: '#F5F7FA',
        surface: '#FFFFFF',
        text: '#0F172A',
        textMuted: '#64748B',
        border: '#E2E8F0',
    },
    // Cada nivel de riesgo tiene un color fuerte y uno suave (para fondos)
    risk: {
        bajo: { main: '#16A34A', soft: '#DCFCE7', label: 'Riesgo bajo' },
        medio: { main: '#D97706', soft: '#FEF3C7', label: 'Riesgo medio' },
        alto: { main: '#DC2626', soft: '#FEE2E2', label: 'Riesgo alto' },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radius: { md: 12, lg: 20 },
} as const;