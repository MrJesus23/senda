export type RiskLevel = 'bajo' | 'medio' | 'alto';

export interface Coordinates {
    lat: number;
    lon: number;
}

export interface ThermalAlert {
    heat_index_c: number;
    risk_level: RiskLevel;
    message: string;
}

export interface AirQualityAlert {
    pm25_ugm3: number;
    risk_level: RiskLevel;
    message: string;
}

export interface HydrologyAlert {
    rain_mm_h: number;
    water_depth_cm: number;
    drag_force_n: number;
    risk_level: RiskLevel;
    message: string;
}

export interface AlertsResponse {
    location: Coordinates;
    calculated_at: string;
    thermal: ThermalAlert;
    air_quality: AirQualityAlert;
    hydrology: HydrologyAlert;
}