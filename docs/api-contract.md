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
  "calculated_at": "2026-10-20T14:00:00Z",
  "thermal": {
    "heat_index_c": 37.1,
    "risk_level": "medio",
    "message": "Calor intenso. Hidrátate seguido y busca sombra si haces esfuerzo al aire libre."
  },
  "air_quality": {
    "pm25_ugm3": 8.0,
    "risk_level": "bajo",
    "message": "Buena calidad del aire. Puedes hacer actividades al aire libre sin restricciones."
  },
  "hydrology": {
    "rain_mm_h": 100.0,
    "water_depth_cm": 14.16,
    "drag_force_n": 367.7,
    "risk_level": "alto",
    "message": "Escorrentía peligrosa, puede arrastrarte. No cruces vías inundadas y busca un lugar alto."
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

- Los ejemplos salen de los casos de prueba TH-04, PA-02 y HD-07 de `docs/fisica.md` y respetan los umbrales de riesgo. Mensajes: `docs/mensajes.md`.
- La app no hace cálculos físicos; solo muestra estos valores.
- Los nombres de los campos van en `snake_case` tal como aparecen aquí.