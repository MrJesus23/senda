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

    return {
        "temp_c": float(actual["temperature_2m"]),
        "humidity": float(actual["relative_humidity_2m"]),
        "wind_kmh": float(actual["wind_speed_10m"]),
        # precipitation viene en mm acumulados en la última hora, equivale a mm/h.
        "rain_mm_h": float(actual["precipitation"]),
        "pm25": float(calidad["pm2_5"]),
    }
