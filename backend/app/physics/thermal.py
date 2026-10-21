"""Confort térmico. Fórmulas y casos de prueba: docs/fisica.md."""

def heat_index_c(temp_c: float, humidity: float) -> float:
    """Índice de calor en °C, basado en la regresión de Rothfusz (NOAA)."""
    
    rh = max(0.0, min(100.0, humidity))

    t_f = (9.0 / 5.0) * temp_c + 32.0

    hi_s = 0.5 * (t_f + 61.0 + 1.2 * (t_f - 68.0) + 0.094 * rh)

    promedio = (hi_s + t_f) / 2.0

    if promedio < 80.0:
        hi_f = hi_s
    else:
        hi_f = (
            -42.379
            + 2.04901523 * t_f
            + 10.14333127 * rh
            - 0.22475541 * t_f * rh
            - 0.00683783 * (t_f ** 2)
            - 0.05481717 * (rh ** 2)
            + 0.00122874 * (t_f ** 2) * rh
            + 0.00085282 * t_f * (rh ** 2)
            - 0.00000199 * (t_f ** 2) * (rh ** 2)
        )

        adj = 0.0
        if rh < 13.0 and 80.0 <= t_f <= 112.0:
            adj = -((13.0 - rh) / 4.0) * (((17.0 - abs(t_f - 95.0)) / 17.0) ** 0.5)
        elif rh > 85.0 and 80.0 <= t_f <= 87.0:
            adj = ((rh - 85.0) / 10.0) * ((87.0 - t_f) / 5.0)

        hi_f += adj

    hi_c = (5.0 / 9.0) * (hi_f - 32.0)
    
    return hi_c

def thermal_risk(hi_c: float) -> str:
    """Clasificación del riesgo térmico según umbrales de NOAA."""
    if hi_c < 32.2:
        return "bajo"
    elif hi_c < 39.4:
        return "medio"
    else:
        return "alto"