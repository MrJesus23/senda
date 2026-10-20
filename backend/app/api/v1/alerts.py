from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import AlertResponse
from app.services.weather_api import fetch_weather, WeatherServiceError

_cache = {}

router = APIRouter()

@router.get("/alerts", response_model=AlertResponse)
async def get_alerts(lat: float, lon: float):
    # 1. Generar la clave (redondeada a 2 decimales) y obtener la hora actual
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

    response_data = {
        "location": {"lat": lat, "lon": lon},
        "calculated_at": now.isoformat().replace("+00:00", "Z"),
        "thermal": {
            "heat_index_c": 38.6,
            "risk_level": "alto",
            "message": "Riesgo de estrés térmico. Evita actividad física prolongada."
        },
        "air_quality": {
            "pm25_ugm3": clima["pm25"],
            "risk_level": "medio",
            "message": "Calidad del aire moderada. Personas sensibles deben limitar el esfuerzo al aire libre."
        },
        "hydrology": {
            "rain_mm_h": clima["rain_mm_h"], 
            "water_depth_cm": 6.5,
            "drag_force_n": 310.2,
            "risk_level": "alto",
            "message": "Escorrentía peligrosa. Evita cruzar vías inundadas."
        }
    }

    _cache[cache_key] = (now, response_data)

    return response_data