"""Calidad del aire. Reglas y casos de prueba: docs/fisica.md."""

def pm25_risk(pm25: float) -> str:
    """Clasifica el riesgo por concentración de PM2.5."""
    
    if pm25 < 0.0:
        raise ValueError("La concentración de PM2.5 no puede ser negativa.")
        
    if pm25 <= 15.0:
        return "bajo"
    elif pm25 <= 37.0:
        return "medio"
    else:
        return "alto"