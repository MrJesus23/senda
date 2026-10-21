import pytest
from app.physics.air_quality import pm25_risk

casos_aq = [
    (0.0, "bajo"), 
    (8.0, "bajo"),  
    (15.0, "bajo"), 
    (15.1, "medio"),
    (28.4, "medio"), 
    (37.0, "medio"), 
    (37.1, "alto"),
    (80.0, "alto"), 
]

@pytest.mark.parametrize("pm25, expected_risk", casos_aq)
def test_pm25_risk(pm25, expected_risk):
    assert pm25_risk(pm25) == expected_risk

def test_pm25_negative_value():
    with pytest.raises(ValueError):
        pm25_risk(-1.0)