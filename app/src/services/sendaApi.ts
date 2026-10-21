import { AlertsResponse } from '../types/api';

// Cuando el backend de Estiben esté desplegado: poner USE_MOCK en false
const USE_MOCK = true;
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

function buildMock(lat: number, lon: number): AlertsResponse {
    return {
        location: { lat, lon },
        calculated_at: new Date().toISOString(),
        thermal: {
            heat_index_c: 38.6,
            risk_level: 'medio',
            message: 'Riesgo de estrés térmico. Evita actividad física prolongada.',
        },
        air_quality: {
            pm25_ugm3: 28.4,
            risk_level: 'bajo',
            message: 'Calidad del aire moderada. Personas sensibles deben limitar el esfuerzo al aire libre.',
        },
        hydrology: {
            rain_mm_h: 42.0,
            water_depth_cm: 6.5,
            drag_force_n: 310.2,
            risk_level: 'alto',
            message: 'Escorrentía peligrosa. Evita cruzar vías inundadas.',
        },
    };
}

export async function getAlerts(lat: number, lon: number): Promise<AlertsResponse> {
    if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // simula la espera de la red
        return buildMock(lat, lon);
    }

    const response = await fetch(`${API_URL}/api/v1/alerts?lat=${lat}&lon=${lon}`);
    if (!response.ok) {
        throw new Error(`El servidor respondió con error ${response.status}`);
    }
    return (await response.json()) as AlertsResponse;
}