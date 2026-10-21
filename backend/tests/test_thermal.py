import pytest
from app.physics.thermal import heat_index_c, thermal_risk

casos_thermal = [
    (24.0, 70.0, 24.3, "bajo"),    
    (28.0, 75.0, 31.4, "bajo"),   
    (27.0, 95.0, 32.0, "bajo"),    
    (32.0, 60.0, 37.1, "medio"),   
    (40.0, 10.0, 36.7, "medio"),  
    (30.0, 90.0, 40.8, "alto"), 
    (36.0, 50.0, 43.1, "alto"),  
    (22.0, 85.0, 22.5, "bajo"),  
]

@pytest.mark.parametrize("t_c, rh, expected_hi, expected_risk", casos_thermal)
def test_thermal_module(t_c, rh, expected_hi, expected_risk):
    hi_c = heat_index_c(t_c, rh)
    # Tolerancia exigida por Camilo: ±0.1 °C
    assert hi_c == pytest.approx(expected_hi, abs=0.1)
    assert thermal_risk(hi_c) == expected_risk

def test_thermal_risk_boundaries():
    assert thermal_risk(32.1) == "bajo"
    assert thermal_risk(32.2) == "medio"
    assert thermal_risk(39.3) == "medio"
    assert thermal_risk(39.4) == "alto"