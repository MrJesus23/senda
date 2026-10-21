from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import AlertResponse
from app.services.weather_api import fetch_weather, WeatherServiceError

from app.physics.thermal import heat_index_c, thermal_risk
from app.physics.air_quality import pm25_risk
from app.physics.hydrology import water_depth_cm, flow_velocity_ms, drag_force_n, hydrology_risk

MESSAGES = {
    "thermal": {
        "bajo": "Sensación térmica normal. Puedes hacer tus actividades al aire libre sin problema.",
        "medio": "Calor intenso. Hidrátate seguido y busca sombra si haces esfuerzo al aire libre.",
        "alto": "Riesgo de estrés térmico. Evita actividad física prolongada y busca un lugar fresco.",
    },
    "air_quality": {
        "bajo": "Buena calidad del aire. Puedes hacer actividades al aire libre sin restricciones.",
        "medio": "Calidad del aire moderada. Personas sensibles deben limitar el esfuerzo al aire libre.",
        "alto": "Aire dañino para la salud. Evita el ejercicio al aire libre y usa tapabocas si sales.",
    },
    "hydrology": {
        "bajo": "Sin riesgo por escorrentía. Si llueve, camina con cuidado sobre superficies mojadas.",
        "medio": "Agua corriendo por las calles. Evita las cunetas y cruza solo por zonas elevadas.",
        "alto": "Escorrentía peligrosa, puede arrastrarte. No cruces vías inundadas y busca un lugar alto.",
    },
}

_cache = {}
router = APIRouter()

@router.get("/alerts", response_model=AlertResponse)
async def get_alerts(lat: float, lon: float):
    cache_key = f"{round(lat, 2)},{round(lon, 2)}"
    now = datetime.now(timezone.utc)

    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if (now - cached_time).total_seconds() < 600:
            return cached_data

    try:
        clima = await fetch_weather(lat, lon)
    except WeatherServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    hi_c = heat_index_c(clima["temp_c"], clima["humidity"])
    t_risk = thermal_risk(hi_c)
    
    aq_risk = pm25_risk(clima["pm25"])
    
    lluvia = clima["rain_mm_h"]
    profundidad = water_depth_cm(lluvia)
    velocidad = flow_velocity_ms(lluvia)
    fuerza = drag_force_n(lluvia)
    h_risk = hydrology_risk(profundidad, velocidad)

    response_data = {
        "location": {"lat": lat, "lon": lon},
        "calculated_at": now.isoformat().replace("+00:00", "Z"),
        "thermal": {
            "heat_index_c": round(hi_c, 1),
            "risk_level": t_risk,
            "message": MESSAGES["thermal"][t_risk]
        },
        "air_quality": {
            "pm25_ugm3": round(clima["pm25"], 1),
            "risk_level": aq_risk,
            "message": MESSAGES["air_quality"][aq_risk]
        },
        "hydrology": {
            "rain_mm_h": round(lluvia, 1),
            "water_depth_cm": round(profundidad, 1),
            "drag_force_n": round(fuerza, 1),
            "risk_level": h_risk,
            "message": MESSAGES["hydrology"][h_risk]
        }
    }

    _cache[cache_key] = (now, response_data)
    return response_data