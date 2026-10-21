import { AlertsResponse } from '../types/api';

// Sin URL, o con EXPO_PUBLIC_USE_MOCK=true, la app usa datos simulados (plan B para la demo)
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || API_URL === '';
const TIMEOUT_MS = 60000; // Render gratuito puede tardar hasta ~1 minuto en despertar

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
        await new Promise((resolve) => setTimeout(resolve, 800));
        return buildMock(lat, lon);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(`${API_URL}/api/v1/alerts?lat=${lat}&lon=${lon}`, {
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`El servidor respondió con error ${response.status}`);
        }
        return (await response.json()) as AlertsResponse;
    } finally {
        clearTimeout(timer);
    }
}