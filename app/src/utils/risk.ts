import { AlertsResponse, RiskLevel } from '../types/api';

const ORDER: RiskLevel[] = ['bajo', 'medio', 'alto'];

// Devuelve el nivel más alto y el mensaje de ese módulo.
// Si hay empate, gana el primero de la lista (lluvia, calor, aire).
export function getOverallRisk(data: AlertsResponse) {
    const items = [
        { level: data.hydrology.risk_level, message: data.hydrology.message },
        { level: data.thermal.risk_level, message: data.thermal.message },
        { level: data.air_quality.risk_level, message: data.air_quality.message },
    ];
    return items.reduce((worst, current) =>
        ORDER.indexOf(current.level) > ORDER.indexOf(worst.level) ? current : worst,
    );
}