"""Confort térmico. Fórmulas y casos de prueba: docs/fisica.md (Camilo)."""


def heat_index_c(temp_c: float, humidity: float) -> float:
    """Índice de calor en °C. PENDIENTE: fórmula de Camilo."""
    raise NotImplementedError("Pendiente: fórmula de docs/fisica.md")


def thermal_risk(hi_c: float) -> str:
    """Devuelve 'bajo', 'medio' o 'alto'. PENDIENTE: umbrales de Camilo."""
    raise NotImplementedError("Pendiente: umbrales de docs/fisica.md")
