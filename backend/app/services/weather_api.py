import httpx

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
TIMEOUT_SEGUNDOS = 10.0


class WeatherServiceError(Exception):
    """Open-Meteo no respondió o respondió con error."""


async def fetch_weather(lat: float, lon: float) -> dict:
    clima_params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation",
    }
    aire_params = {
        "latitude": lat,
        "longitude": lon,
        "current": "pm2_5",
    }

    async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as client:
        try:
            resp_clima = await client.get(FORECAST_URL, params=clima_params)
            resp_aire = await client.get(AIR_QUALITY_URL, params=aire_params)
            resp_clima.raise_for_status()
            resp_aire.raise_for_status()
        except httpx.HTTPError as exc:
            raise WeatherServiceError(f"Error consultando Open-Meteo: {exc}") from exc

    actual = resp_clima.json()["current"]
    calidad = resp_aire.json()["current"]

    intervalo_s = float(actual.get("interval", 3600))
    precip_mm = float(actual.get("precipitation", 0.0))

    return {
        "temp_c": float(actual.get("temperature_2m", 0.0)),
        "humidity": float(actual.get("relative_humidity_2m", 0.0)),
        "wind_kmh": float(actual.get("wind_speed_10m", 0.0)),
        "rain_mm_h": precip_mm * 3600.0 / intervalo_s,
        "pm25": float(calidad.get("pm2_5", 0.0)),
    }