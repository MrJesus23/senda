# Contrato de la API — SENDA v1

Este documento es el acuerdo entre el backend y la app. Si algo aquí
cambia, se avisa a todo el equipo antes de programarlo.

## Endpoint

`GET /api/v1/alerts`

### Parámetros (query)

| Parámetro | Tipo   | Obligatorio | Descripción                        |
|-----------|--------|-------------|------------------------------------|
| `lat`     | número | Sí          | Latitud, entre -90 y 90            |
| `lon`     | número | Sí          | Longitud, entre -180 y 180         |

### Respuesta exitosa (200)

```json
{
  "location": { "lat": 6.2442, "lon": -75.5812 },
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
```

### Campos

| Campo | Tipo | Unidad / valores |
|-------|------|------------------|
| `calculated_at` | texto | Fecha y hora en formato ISO 8601, en UTC |
| `thermal.heat_index_c` | número | °C |
| `air_quality.pm25_ugm3` | número | µg/m³ |
| `hydrology.rain_mm_h` | número | mm/h |
| `hydrology.water_depth_cm` | número | cm |
| `hydrology.drag_force_n` | número | Newtons |
| `risk_level` | texto | Solo `"bajo"`, `"medio"` o `"alto"` |
| `message` | texto | Recomendación en español, lista para mostrar |

### Errores

| Código | Cuándo | Cuerpo |
|--------|--------|--------|
| 422 | `lat` o `lon` faltan o son inválidos | Lo genera FastAPI automáticamente |
| 502 | El servicio externo del clima falló | `{ "detail": "texto del error" }` |

## Reglas

- Los números de los ejemplos son ilustrativos.
- La app no hace cálculos físicos; solo muestra estos valores.
- Los nombres de los campos van en `snake_case` tal como aparecen aquí.