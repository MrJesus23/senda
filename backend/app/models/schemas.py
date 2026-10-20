from pydantic import BaseModel
from typing import Literal

class Location(BaseModel):
    lat: float
    lon: float

class ThermalAlert(BaseModel):
    heat_index_c: float
    risk_level: Literal["bajo", "medio", "alto"]
    message: str

class AirQualityAlert(BaseModel):
    pm25_ugm3: float
    risk_level: Literal["bajo", "medio", "alto"]
    message: str

class HydrologyAlert(BaseModel):
    rain_mm_h: float
    water_depth_cm: float
    drag_force_n: float
    risk_level: Literal["bajo", "medio", "alto"]
    message: str

class AlertResponse(BaseModel):
    location: Location
    calculated_at: str
    thermal: ThermalAlert
    air_quality: AirQualityAlert
    hydrology: HydrologyAlert