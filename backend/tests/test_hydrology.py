import pytest
from app.physics.hydrology import water_depth_cm, flow_velocity_ms, drag_force_n, hydrology_risk

# Datos de la Tabla 3.7 de docs/fisica.md
casos_hydro = [
    (0.0,   0.0,   0.0,   0.0,   "bajo"),
    (10.0,  3.56,  1.17,  14.6,  "bajo"), 
    (30.0,  6.88,  1.82,  68.1,  "bajo"), 
    (50.0,  9.35,  2.23,  139.3, "bajo"),
    (60.0,  10.43, 2.40,  179.8, "medio"),
    (80.0,  12.39, 2.69,  269.0, "medio"),
    (100.0, 14.16, 2.94,  367.7, "alto"),
    (120.0, 15.80, 3.16,  474.6, "alto"),
]

@pytest.mark.parametrize("p, expected_h, expected_v, expected_f, expected_risk", casos_hydro)
def test_hydrology_module(p, expected_h, expected_v, expected_f, expected_risk):
    h_cm = water_depth_cm(p)
    v_ms = flow_velocity_ms(p)
    f_n = drag_force_n(p)
    
    # Tolerancia relativa del 0.5% (rel=0.005) como pide Camilo
    assert h_cm == pytest.approx(expected_h, rel=0.005, abs=0.01)
    assert v_ms == pytest.approx(expected_v, rel=0.005, abs=0.01)
    assert f_n == pytest.approx(expected_f, rel=0.005, abs=0.1)
    assert hydrology_risk(h_cm, v_ms) == expected_risk

casos_risk = [
    (10.0, 2.0, "bajo"),
    (12.0, 2.0, "medio"),
    (15.0, 2.5, "medio"), 
    (21.0, 2.0, "alto"), 
    (11.0, 3.5, "alto"), 
]

@pytest.mark.parametrize("h, v, expected_risk", casos_risk)
def test_hydrology_risk(h, v, expected_risk):
    assert hydrology_risk(h, v) == expected_risk