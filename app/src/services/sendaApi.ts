import { AlertsResponse } from '../types/api';

// Cuando el backend de Estiben esté desplegado: poner USE_MOCK en false
const USE_MOCK = true;
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

function buildMock(lat: number, lon: number): AlertsResponse {
    return {
        location: { lat, lon },
        calculated_at: new Date().toISOString(),
        thermal: {
            heat_index_c: 37.1,
            risk_level: 'medio',
            message: 'Calor intenso. Hidrátate seguido y busca sombra si haces esfuerzo al aire libre.',
        },
        air_quality: {
            pm25_ugm3: 8.0,
            risk_level: 'bajo',
            message: 'Buena calidad del aire. Puedes hacer actividades al aire libre sin restricciones.',
        },
        hydrology: {
            rain_mm_h: 100.0,
            water_depth_cm: 14.16,
            drag_force_n: 367.7,
            risk_level: 'alto',
            message: 'Escorrentía peligrosa, puede arrastrarte. No cruces vías inundadas y busca un lugar alto.',
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