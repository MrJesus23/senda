# SENDA — Mensajes de las alertas

| | |
|---|---|
| **Archivo** | `docs/mensajes.md` |
| **Responsable** | Kelly — Documentación, QA y presentación |
| **Lo consumen** | Estiben (backend) y Jesús (app) |

Un mensaje por módulo y por nivel de riesgo (3 × 3 = 9). Cada mensaje dice primero **qué pasa** y después **qué hacer**, en máximo unos 90 caracteres. Los rangos de cada nivel son los de `docs/fisica.md`.

## Mensajes

| Módulo | Nivel | Cuándo aplica | Mensaje |
|---|---|---|---|
| Térmico (`thermal`) | `bajo` | Índice de calor < 32,2 °C | Sensación térmica normal. Puedes hacer tus actividades al aire libre sin problema. |
| Térmico (`thermal`) | `medio` | 32,2 °C ≤ índice de calor < 39,4 °C | Calor intenso. Hidrátate seguido y busca sombra si haces esfuerzo al aire libre. |
| Térmico (`thermal`) | `alto` | Índice de calor ≥ 39,4 °C | Riesgo de estrés térmico. Evita actividad física prolongada y busca un lugar fresco. |
| Calidad del aire (`air_quality`) | `bajo` | PM2.5 ≤ 15 µg/m³ | Buena calidad del aire. Puedes hacer actividades al aire libre sin restricciones. |
| Calidad del aire (`air_quality`) | `medio` | 15 < PM2.5 ≤ 37 µg/m³ | Calidad del aire moderada. Personas sensibles deben limitar el esfuerzo al aire libre. |
| Calidad del aire (`air_quality`) | `alto` | PM2.5 > 37 µg/m³ | Aire dañino para la salud. Evita el ejercicio al aire libre y usa tapabocas si sales. |
| Escorrentía (`hydrology`) | `bajo` | h·v < 0,22 m²/s (lluvia leve o sin lluvia) | Sin riesgo por escorrentía. Si llueve, camina con cuidado sobre superficies mojadas. |
| Escorrentía (`hydrology`) | `medio` | 0,22 ≤ h·v < 0,40 m²/s (desde ≈ 53 mm/h) | Agua corriendo por las calles. Evita las cunetas y cruza solo por zonas elevadas. |
| Escorrentía (`hydrology`) | `alto` | h·v ≥ 0,40 m²/s o F ≥ 369 N (desde ≈ 97 mm/h) | Escorrentía peligrosa, puede arrastrarte. No cruces vías inundadas y busca un lugar alto. |

## Para el código (Estiben)

Los mismos textos, listos para copiar en un diccionario de Python:

```python
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
```

Uso: `MESSAGES["thermal"][risk_level]`.
