from fastapi import APIRouter
from app.models.schemas import AlertResponse

router = APIRouter()

@router.get("/alerts", response_model=AlertResponse)
async def get_alerts(lat: float, lon: float):
    return {
        "location": { "lat": lat, "lon": lon },
        "calculated_at": "2026-10-17T14:00:00Z",
        "thermal": {
            "heat_index_c": 38.6,
            "risk_level": "alto",
            "message": "Riesgo de estrés térmico. Evita actividad física prolongada."
        },
        "air_quality": {
            "pm25_ugm3": 28.4,
            "risk_level": "medio",
            "message": "Calidad del aire moderada. Personas sensibles deben limitar el esfuerzo al aire libre."
        },
        "hydrology": {
            "rain_mm_h": 42.0,
            "water_depth_cm": 6.5,
            "drag_force_n": 310.2,
            "risk_level": "alto",
            "message": "Escorrentía peligrosa. Evita cruzar vías inundadas."
        }
    }