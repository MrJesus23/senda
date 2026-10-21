"""Módulo hidrodinámico. Fórmulas y casos de prueba: docs/fisica.md (Camilo)."""

def _base_hidrodinamica(rain_mm_h: float, length_m: float, n: float, slope: float) -> tuple[float, float]:
    """Función interna que calcula el caudal (q) en m²/s y la profundidad (h) en metros."""
    if rain_mm_h <= 0.0:
        return 0.0, 0.0
        
    i_ms = rain_mm_h / 3600000.0
    
    q = i_ms * length_m
    
    h_m = ((q * n) / (slope ** 0.5)) ** 0.6
    
    return q, h_m

def water_depth_cm(rain_mm_h: float, length_m: float = 15000.0, n: float = 0.016, slope: float = 0.03) -> float:
    """Calcula la profundidad del agua en cm sobre la calle tipo."""
    _, h_m = _base_hidrodinamica(rain_mm_h, length_m, n, slope)
    return h_m * 100.0  # Convertir de metros a centímetros

def flow_velocity_ms(rain_mm_h: float, length_m: float = 15000.0, n: float = 0.016, slope: float = 0.03) -> float:
    """Calcula la velocidad del flujo de escorrentía en m/s."""
    q, h_m = _base_hidrodinamica(rain_mm_h, length_m, n, slope)
    if h_m == 0.0:
        return 0.0
    return q / h_m

def drag_force_n(rain_mm_h: float, length_m: float = 15000.0, n: float = 0.016, slope: float = 0.03, person_width_m: float = 0.5, cd: float = 1.2, rho: float = 1000.0) -> float:
    """Calcula la fuerza de arrastre en Newtons ejercida sobre un peatón."""
    q, h_m = _base_hidrodinamica(rain_mm_h, length_m, n, slope)
    if h_m == 0.0:
        return 0.0
        
    v = q / h_m
    area_sumergida = person_width_m * h_m
    fuerza = 0.5 * rho * area_sumergida * cd * (v ** 2)
    return fuerza

def hydrology_risk(depth_cm: float, velocity_ms: float) -> str:
    """Evalúa el riesgo de la escorrentía usando criterios de estabilidad humana."""
    h_m = depth_cm / 100.0
    
    hv = h_m * velocity_ms 
    hv2 = h_m * (velocity_ms ** 2)
    
    if hv >= 0.40 or hv2 >= 1.23:
        return "alto"
    elif hv >= 0.22:
        return "medio"
    else:
        return "bajo"