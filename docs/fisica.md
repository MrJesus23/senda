# SENDA — Fundamentos físicos y validación

| | |
|---|---|
| **Archivo** | `docs/fisica.md` |
| **Responsable** | Camilo — Física y Validación |
| **Lo consume** | Estiben — backend (`backend/app/physics/`) |
| **Versión** | 1.0 (borrador para revisión) |

Este documento define, para cada uno de los tres módulos de SENDA, las variables con sus unidades, las fórmulas, las fuentes, los umbrales de riesgo (`"bajo"`, `"medio"`, `"alto"`) y los casos de prueba. Las funciones de `physics/` deben implementarlo tal cual.

> **Los valores esperados** de las tablas de prueba se calcularon con las fórmulas de este documento (el Apéndice A permite reproducirlos en una hoja de cálculo) y se contrastaron con una implementación independiente en Python.

## 0. Resumen

| Módulo | Entradas (de Open-Meteo) | Salida (campo del contrato) | Método |
|---|---|---|---|
| Térmico | `temp_c`, `humidity` | `thermal.heat_index_c`, `risk_level` | Índice de Calor NWS (regresión de Rothfusz) |
| Calidad del aire | `pm25` | `air_quality.pm25_ugm3`, `risk_level` | Umbrales OMS 2021 y Resolución 2254 de 2017 |
| Hidrodinámico | `rain_mm_h` | `hydrology.water_depth_cm`, `drag_force_n`, `risk_level` | Flujo en lámina, onda cinemática + Manning |

**Convenciones:** unidades del SI salvo donde se indique (°C, °F, mm/h, µg/m³). Los niveles se escriben exactamente `"bajo"`, `"medio"`, `"alto"`. El nivel de riesgo se calcula con los valores **sin redondear**; solo se redondea (a 1 decimal) al armar la respuesta.

---

## 1. Módulo térmico — Índice de Calor (Heat Index)

### 1.1 Variables y unidades

| Símbolo | Variable | Unidad | Origen |
|---|---|---|---|
| `temp_c` | Temperatura del aire a 2 m | °C | Open-Meteo `temperature_2m` |
| `humidity` (RH) | Humedad relativa | % (0–100) | Open-Meteo `relative_humidity_2m` |
| T | Temperatura en °F | °F | conversión |
| HI_s | Índice simple (Steadman) | °F | calculado |
| HI | Índice de Calor | °F, luego °C | calculado |
| ADJ | Ajuste de la regresión | °F | calculado |

El viento (`wind_kmh`) se guarda pero **no entra** en la fórmula (v1). El UV y el albedo quedan para la versión 2.

### 1.2 Fórmulas (NWS/NOAA)

**Paso 1 — °C a °F**

$$T = \tfrac{9}{5}\,T_{°C} + 32$$

**Paso 2 — Fórmula simple (consistente con Steadman)**

$$HI_s = 0.5\,\big[\,T + 61.0 + 1.2\,(T-68.0) + 0.094\,RH\,\big]$$

**Paso 3 — Elegir la rama.** NWS calcula primero $HI_s$ y lo promedia con la temperatura:

- Si $\dfrac{HI_s + T}{2} < 80\,°F$ → $HI = HI_s$ (no se usa la regresión).
- Si $\dfrac{HI_s + T}{2} \ge 80\,°F$ → se aplica la regresión de Rothfusz con sus ajustes.

**Paso 4 — Regresión de Rothfusz** (T en °F, RH en %):

$$
\begin{aligned}
HI = {}& -42.379 + 2.04901523\,T + 10.14333127\,RH - 0.22475541\,T\,RH \\
& - 0.00683783\,T^2 - 0.05481717\,RH^2 + 0.00122874\,T^2 RH \\
& + 0.00085282\,T\,RH^2 - 0.00000199\,T^2 RH^2
\end{aligned}
$$

**Paso 5 — Ajustes** (solo en la rama de Rothfusz, se **suman** a HI):

- Si $RH < 13\,\%$ y $80 \le T \le 112\,°F$:
  $$ADJ = -\frac{13 - RH}{4}\sqrt{\frac{17 - |T - 95|}{17}}$$
- Si $RH > 85\,\%$ y $80 \le T \le 87\,°F$:
  $$ADJ = \frac{RH - 85}{10}\cdot\frac{87 - T}{5}$$
- En cualquier otro caso, $ADJ = 0$.

**Paso 6 — °F a °C**

$$HI_{°C} = \tfrac{5}{9}\,(HI - 32)$$

### 1.3 Rango de validez y decisiones

- La regresión de Rothfusz **no es apropiada cuando el índice resulta menor a ~80 °F** (≈ 26,7 °C); por eso existe la rama simple del Paso 3. Tampoco es válida para condiciones extremas fuera del rango de datos de Steadman (NWS).
- Los ajustes solo se aplican dentro de las ventanas de T y RH del Paso 5.
- El índice supone **sombra y viento ligero**; el sol directo puede aumentar la sensación térmica hasta ~15 °F (≈ 8 °C) según NWS, así que en pleno sol el valor real puede ser mayor al reportado. Debe decirse en el informe.
- En un día típico del Valle de Aburrá (≈ 22–28 °C) el cálculo cae casi siempre en la rama simple o en valores bajo 32,2 °C, y se reporta `"bajo"`. `"medio"` y `"alto"` aparecen en episodios de calor intenso.
- Los umbrales de NOAA se definieron para Estados Unidos; en v1 no se adopta un umbral local distinto.

### 1.4 Umbrales

Se toman de las categorías oficiales del NWS (Heat Index Chart) y se convierten a °C:

| Nivel SENDA | Rango de HI (°C) | Equivalente en °F | Categoría NWS |
|---|---|---|---|
| `"bajo"` | HI < 32,2 | < 90 | Caution (80–90 °F) o sin categoría |
| `"medio"` | 32,2 ≤ HI < 39,4 | 90 a < 103 | Extreme Caution |
| `"alto"` | HI ≥ 39,4 | ≥ 103 | Danger y Extreme Danger |

**Nota sobre la propuesta inicial (< 32 / 32–41 / > 41):** el límite de 41 °C (≈ 105,8 °F) corresponde a la tabla antigua del NWS, donde "Danger" empezaba en 105 °F. La clasificación vigente usa 103 °F (= 39,4 °C). Se adopta 32,2 y 39,4 para coincidir con el NWS actual.

### 1.5 Casos de prueba

Tolerancia: ±0,1 °C en `HI_°C`. "Prom." es $(HI_s+T)/2$ en °F.

| ID | T (°C) | RH (%) | T (°F) | Prom. (°F) | Rama | ADJ (°F) | HI (°F) | HI esperado (°C) | Nivel | Método |
|---|---|---|---|---|---|---|---|---|---|---|
| TH-01 | 24,0 | 70 | 75,2 | 75,46 | Simple | — | 75,71 | **24,3** | bajo | Apéndice A.1 |
| TH-02 | 28,0 | 75 | 82,4 | 83,13 | Rothfusz | 0 | 88,44 | **31,4** | bajo | Apéndice A.1 |
| TH-03 | 27,0 | 95 | 80,6 | 81,71 | Rothfusz | +1,28 (húmedo) | 89,57 | **32,0** | bajo | Apéndice A.1 |
| TH-04 | 32,0 | 60 | 89,6 | 90,34 | Rothfusz | 0 | 98,73 | **37,1** | medio | Resuelto en 1.6 |
| TH-05 | 40,0 | 10 | 104,0 | 104,28 | Rothfusz | −0,51 (seco) | 98,07 | **36,7** | medio | Apéndice A.1 |
| TH-06 | 30,0 | 90 | 86,0 | 87,27 | Rothfusz | +0,10 (húmedo) | 105,39 | **40,8** | alto | Apéndice A.1 |
| TH-07 | 36,0 | 50 | 96,8 | 97,66 | Rothfusz | 0 | 109,65 | **43,1** | alto | Apéndice A.1 |
| TH-08 | 22,0 | 85 | 71,6 | 72,03 | Simple | — | 72,45 | **22,5** | bajo | Apéndice A.1 |

**Pruebas de frontera de `thermal_risk(hi_c)`** (entrada directa en °C):

| Entrada | Esperado |
|---|---|
| 32,1 | bajo |
| 32,2 | medio |
| 39,3 | medio |
| 39,4 | alto |

**Contraste con la tabla oficial del NWS** (implementación vs. valor de la tabla, en °F):

| T (°F) | RH (%) | Calculado | Tabla NWS | Diferencia |
|---|---|---|---|---|
| 90 | 40 | 90,7 | 91 | −0,3 |
| 90 | 60 | 99,7 | 100 | −0,3 |
| 90 | 80 | 113,3 | 113 | +0,3 |
| 90 | 100 | 131,6 | 132 | −0,4 |
| 96 | 60 | 116,1 | 116 | +0,1 |
| 100 | 60 | 129,5 | 129 | +0,5 |

Las diferencias (≤ 0,5 °F) son de redondeo de la tabla publicada.

### 1.6 Ejemplo resuelto (TH-04: 32 °C, 60 %)

1. $T = 1{,}8 \cdot 32 + 32 = 89{,}6\ °F$
2. $HI_s = 0{,}5\,[89{,}6 + 61 + 1{,}2\,(21{,}6) + 0{,}094 \cdot 60] = 91{,}08\ °F$
3. Promedio: $(91{,}08 + 89{,}6)/2 = 90{,}34 \ge 80$ → rama de Rothfusz.
4. Términos de la regresión: −42,379 + 183,592 + 608,600 − 1208,285 − 54,895 − 197,342 + 591,871 + 275,086 − 57,514 = **98,73 °F**
5. RH no es < 13 % ni > 85 % → $ADJ = 0$.
6. $HI_{°C} = (98{,}73 - 32) \cdot 5/9 = 37{,}07\ °C$ → $32{,}2 \le 37{,}07 < 39{,}4$ → **medio**.

---

## 2. Módulo de calidad del aire — PM2.5

No hay fórmula: es una clasificación por umbrales de la concentración.

### 2.1 Variables y unidades

| Símbolo | Variable | Unidad | Origen |
|---|---|---|---|
| `pm25` | Concentración de material particulado fino (≤ 2,5 µm) | µg/m³ | Open-Meteo Air Quality `pm2_5` |

### 2.2 Regla

$$
\text{nivel}=
\begin{cases}
\text{bajo} & pm25 \le 15 \\
\text{medio} & 15 < pm25 \le 37 \\
\text{alto} & pm25 > 37
\end{cases}
$$

Entradas negativas o ausentes no son válidas: el backend debe tratarlas como error de datos (no clasificarlas).

### 2.3 Fuentes de los umbrales

| Umbral | Valor | Fuente |
|---|---|---|
| Límite `bajo` / `medio` | 15 µg/m³ (media de 24 h) | OMS, *Directrices mundiales de la OMS sobre la calidad del aire* (2021): nivel guía de PM2.5 a 24 h |
| Límite `medio` / `alto` | 37 µg/m³ (media de 24 h) | Resolución 2254 de 2017 (MinAmbiente, Colombia), art. 2, parágrafo 1: nivel máximo permisible a 24 h desde el 1 de julio de 2018 |

Comprobaciones de coherencia: 37 µg/m³ es prácticamente la meta intermedia 3 de la OMS (37,5 µg/m³), y el Índice de Calidad del Aire colombiano pasa a naranja desde 38 µg/m³ (PM2.5, 24 h). La Resolución 2254 también define niveles más estrictos desde 2030; no se usan en v1.

Un valor está en `"bajo"` si **no supera** 15 y en `"alto"` si **supera** 37 (se excede el límite cuando la concentración es mayor al valor).

### 2.3.1 Limitación importante

Las dos referencias son **promedios de 24 horas**; el dato de Open-Meteo es la concentración **horaria** de un modelo de gran escala (no un sensor local). Comparar un valor horario con un umbral diario es una aproximación: debe decirse en el informe. Mejora futura: promediar las últimas 24 h o usar datos de la red local (SIATA).

### 2.4 Casos de prueba

| ID | pm25 (µg/m³) | Esperado | Método |
|---|---|---|---|
| PA-01 | 0,0 | bajo | Comparación manual con la regla 2.2 |
| PA-02 | 8,0 | bajo | ídem |
| PA-03 | 15,0 | bajo (límite incluido) | ídem |
| PA-04 | 15,1 | medio | ídem |
| PA-05 | 28,4 | medio | ídem |
| PA-06 | 37,0 | medio (límite incluido) | ídem |
| PA-07 | 37,1 | alto | ídem |
| PA-08 | 80,0 | alto | ídem |

---

## 3. Módulo hidrodinámico — escorrentía y fuerza de arrastre

> **Este es un modelo simplificado.** Representa el equilibrio del flujo en lámina sobre una calle tipo, con parámetros fijos para toda la zona. Sirve como indicador de riesgo, no como simulación hidráulica ni certificación de seguridad.

### 3.1 Hipótesis del modelo

1. Flujo en lámina de ancho mucho mayor que la profundidad, sobre una calle de pendiente uniforme.
2. **Onda cinemática:** el caudal que sale de la calle en equilibrio es igual al que aporta la lluvia.
3. **Manning** relaciona caudal, profundidad y pendiente.
4. Lluvia constante y uniforme, sostenida el tiempo suficiente para llegar al equilibrio (del orden de 10 minutos).
5. Una persona de pie con el agua actuando sobre su área frontal sumergida.

### 3.2 Variables y unidades

| Símbolo | Variable | Unidad |
|---|---|---|
| P (`rain_mm_h`) | Intensidad de lluvia | mm/h |
| i | Intensidad de lluvia | m/s |
| L | Longitud equivalente de aporte | m |
| q | Caudal por metro de ancho | m²/s |
| n | Rugosidad de Manning | s/m^(1/3) |
| S | Pendiente de la calle | adimensional (m/m) |
| h | Profundidad del agua | m (la API la entrega en cm) |
| v | Velocidad del flujo | m/s |
| ρ | Densidad del agua | kg/m³ |
| w | Ancho de la persona | m |
| A | Área frontal sumergida | m² |
| Cd | Coeficiente de arrastre | adimensional |
| F | Fuerza de arrastre | N |

### 3.3 Fórmulas

$$i = \frac{P}{1000 \cdot 3600} = \frac{P}{3{,}6\times 10^{6}} \quad [\text{m/s}]$$

$$q = i \cdot L \quad [\text{m}^2/\text{s}]$$

$$h = \left(\frac{q\,n}{\sqrt{S}}\right)^{3/5} \quad [\text{m}]$$

$$v = \frac{q}{h} \quad [\text{m/s}]$$

$$A = w \cdot h \quad [\text{m}^2]$$

$$F = \tfrac{1}{2}\,\rho\,A\,C_d\,v^2 \quad [\text{N}]$$

La profundidad sale de despejar la ecuación de Manning para canal ancho, $q = \frac{1}{n}\,h^{5/3}\sqrt{S}$. Si $P \le 0$: $h = v = F = 0$.

### 3.4 Parámetros fijos de la zona

| Parámetro | Valor | Justificación |
|---|---|---|
| **L** | **15 000 m** (longitud equivalente de aporte) | Ver 3.4.1 |
| **n** | **0,016** | Asfalto de textura rugosa (calle envejecida). Tablas de Manning para pavimentos (Chow 1959; FHWA HEC-22; TxDOT): asfalto liso 0,013 y rugoso 0,016. Dentro del rango 0,012–0,017 de la guía |
| **S** | **0,03** (3 %) | Calle colectora de ladera típica del Valle de Aburrá (supuesto). Calles del plano del valle < 1 %; de ladera pueden superar 10 % |
| **w** | **0,5 m** | Ancho aproximado de un adulto |
| **Cd** | **1,2** | Valor de la guía del equipo para un cuerpo romo |
| **ρ** | **1000 kg/m³** | Agua. El agua con lodo es más densa, así que el valor es conservador a la baja |

#### 3.4.1 Por qué L = 15 000 m

Si L se toma como la longitud física de la calle (100–500 m), el resultado es correcto para una lámina pura pero **físicamente irrelevante**: con 100 mm/h y L = 100 m sale h ≈ 0,7 cm y F ≈ 0,3 N; con L = 500 m, h ≈ 1,8 cm y F ≈ 3 N. Una persona no corre riesgo con eso, y no refleja lo que se observa en una tormenta fuerte.

Lo que pasa en una calle real es que **recibe agua de toda la superficie que le drena** (techos, patios, vías y laderas adyacentes), no solo de su propia calzada. Se modela con una longitud equivalente que sigue el método racional ($Q = C\,i\,A_c$):

$$L = \frac{C \cdot A_c}{B}$$

Con $C = 0{,}9$ (superficies urbanas impermeables; valores típicos 0,7–0,95), ancho de calzada $B = 8$ m y una microcuenca aportante $A_c \approx 13$ ha, resulta $L \approx 15\,000$ m. El valor se fija para que, con lluvias fuertes (60–100 mm/h), la profundidad y la velocidad queden en los órdenes de magnitud reportados para inundaciones en calles (ver 3.5). **Es un parámetro calibrado**, y se documenta como tal.

### 3.5 Verificación de realismo

Barrido de intensidades con los parámetros de 3.4:

| P (mm/h) | q (m²/s) | h (cm) | v (m/s) | F (N) | h·v (m²/s) |
|---|---|---|---|---|---|
| 10 | 0,0417 | 3,56 | 1,17 | 14,6 | 0,042 |
| 30 | 0,1250 | 6,88 | 1,82 | 68,1 | 0,125 |
| 50 | 0,2083 | 9,35 | 2,23 | 139,3 | 0,208 |
| **60** | 0,2500 | **10,43** | **2,40** | **179,8** | 0,250 |
| **80** | 0,3333 | **12,39** | **2,69** | **269,0** | 0,333 |
| **100** | 0,4167 | **14,16** | **2,94** | **367,7** | 0,417 |
| 120 | 0,5000 | 15,80 | 3,16 | 474,6 | 0,500 |

Con lluvia fuerte (60–100 mm/h) el modelo da **profundidades de 10–14 cm, velocidades de 2,4–2,9 m/s y fuerzas de 180–370 N**.

Comprobaciones:

- **Contra la literatura:** los criterios de diseño para calles inundadas limitan la profundidad a ≤ 0,5 m y la velocidad a ≤ 3 m/s (Shand et al. 2011, citado en David & Carvalho 2021). Los resultados quedan dentro de ese rango, y la velocidad se acerca al límite justo en el nivel `"alto"`.
- **Orden de magnitud de la fuerza (comprobación aparte, no parte del modelo):** una persona de 70 kg pesa ≈ 690 N. Con un coeficiente de fricción supuesto de 0,4–0,5 sobre asfalto mojado, el deslizamiento ocurriría con F ≈ 275–345 N, coherente con que el nivel `"alto"` empiece en ≈ 350 N.
- **Régimen:** Froude ≈ 2,0–2,5 (flujo supercrítico, normal en calles empinadas).
- **Sensibilidad (80 mm/h, n entre 0,012 y 0,017, S entre 1 % y 5 %):** h = 8,9–17,9 cm; v = 1,9–3,7 m/s; F = 187–373 N. Los parámetros cambian cómo se reparte q entre profundidad y velocidad, **pero h·v = q no depende de n ni de S**; por eso el nivel de riesgo por h·v es robusto a esas incertidumbres.

### 3.6 Umbrales de riesgo

Se usan dos criterios de estabilidad de personas en calles inundadas:

- **Criterio A (producto profundidad × velocidad):** $h\cdot v$ [m²/s]
- **Criterio B (deslizamiento):** $h\cdot v^2$ [m³/s²]. Es proporcional a la fuerza de arrastre: $F = \tfrac12\rho\,C_d\,w\,(h v^2)$, que con los parámetros fijos vale $300\,(h v^2)$ N.

| Nivel | Condición |
|---|---|
| `"bajo"` | $h\cdot v < 0{,}22$ y $h\cdot v^2 < 1{,}23$ |
| `"medio"` | $0{,}22 \le h\cdot v < 0{,}40$ (y $h\cdot v^2 < 1{,}23$) |
| `"alto"` | $h\cdot v \ge 0{,}40$ **o** $h\cdot v^2 \ge 1{,}23$ (equivale a $F \ge 369$ N) |

Equivalencia en lluvia con los parámetros de 3.4: `"medio"` desde ≈ 53 mm/h y `"alto"` desde ≈ 97 mm/h.

| Umbral | Fuente |
|---|---|
| 0,22 m²/s | Martínez-Gomariz, Gómez & Russo (2016): criterio experimental más restrictivo para peatones |
| 0,40 m²/s | Directrices australianas de 1987 para calles (citadas en David & Carvalho 2021); Xia & Falconer: vuelco de niños |
| 1,23 m³/s² | Criterio de deslizamiento de CIRIA C635 (Balmforth et al. 2006; Nanía et al. 2002) |

Con estos parámetros el criterio B queda siempre cubierto por el A (se activa a ≈ 100 mm/h, y A a ≈ 96); se conserva porque es el criterio que se relaciona con la fuerza de arrastre y se vuelve determinante si cambia la pendiente.

### 3.7 Casos de prueba

Tolerancia relativa: 0,5 %.

**Cadena completa** (`rain_mm_h` → profundidad, velocidad, fuerza y nivel):

| ID | P (mm/h) | q (m²/s) | h (cm) | v (m/s) | F (N) | h·v | Nivel | Método |
|---|---|---|---|---|---|---|---|---|
| HD-01 | 0 | 0 | 0 | 0 | 0 | 0 | bajo | Caso especial (3.3) |
| HD-02 | 10 | 0,0417 | 3,56 | 1,17 | 14,6 | 0,042 | bajo | Apéndice A.3 |
| HD-03 | 30 | 0,1250 | 6,88 | 1,82 | 68,1 | 0,125 | bajo | Apéndice A.3 |
| HD-04 | 50 | 0,2083 | 9,35 | 2,23 | 139,3 | 0,208 | bajo | Apéndice A.3 |
| HD-05 | 60 | 0,2500 | 10,43 | 2,40 | 179,8 | 0,250 | medio | Apéndice A.3 |
| HD-06 | 80 | 0,3333 | 12,39 | 2,69 | 269,0 | 0,333 | medio | Resuelto en 3.8 |
| HD-07 | 100 | 0,4167 | 14,16 | 2,94 | 367,7 | 0,417 | alto | Apéndice A.3 |
| HD-08 | 120 | 0,5000 | 15,80 | 3,16 | 474,6 | 0,500 | alto | Apéndice A.3 |

**Función de riesgo** `hydrology_risk(depth_cm, velocity_ms)`:

| ID | Profundidad (cm) | Velocidad (m/s) | h·v | h·v² | Esperado |
|---|---|---|---|---|---|
| HR-01 | 10 | 2,0 | 0,200 | 0,400 | bajo |
| HR-02 | 12 | 2,0 | 0,240 | 0,480 | medio |
| HR-03 | 15 | 2,5 | 0,375 | 0,938 | medio |
| HR-04 | 21 | 2,0 | 0,420 | 0,840 | alto (criterio A) |
| HR-05 | 11 | 3,5 | 0,385 | 1,348 | alto (criterio B) |

### 3.8 Ejemplo resuelto (HD-06: 80 mm/h)

1. $i = 80 / 3{,}6\times10^{6} = 2{,}222\times10^{-5}$ m/s
2. $q = 2{,}222\times10^{-5} \cdot 15\,000 = 0{,}3333$ m²/s
3. $q\,n/\sqrt{S} = 0{,}3333 \cdot 0{,}016 / \sqrt{0{,}03} = 0{,}3333 \cdot 0{,}016 / 0{,}17321 = 0{,}03079$
4. $h = 0{,}03079^{0{,}6} = 0{,}1239$ m $= 12{,}39$ cm
5. $v = 0{,}3333 / 0{,}1239 = 2{,}690$ m/s
6. $A = 0{,}5 \cdot 0{,}1239 = 0{,}06195$ m²
7. $F = 0{,}5 \cdot 1000 \cdot 0{,}06195 \cdot 1{,}2 \cdot 2{,}690^2 = 269{,}0$ N
8. $h\cdot v = 0{,}333$ → $0{,}22 \le 0{,}333 < 0{,}40$ y $h\cdot v^2 = 0{,}897 < 1{,}23$ → **medio**.

### 3.9 Limitaciones (para el informe)

- **Es un modelo simplificado:** un solo flujo permanente en una calle tipo, con parámetros únicos para toda la zona. No usa la pendiente ni el entorno reales de la ubicación del usuario (la pendiente topográfica real queda como trabajo futuro).
- **No modela el alcantarillado ni los sumideros**, que en la práctica evacúan parte del agua. Por eso tiende a sobrestimar la profundidad en lluvias moderadas.
- **L es un parámetro calibrado** que resume el área aportante; no se midió una calle específica.
- Supone que la lluvia dura lo suficiente para llegar al equilibrio. El dato de Open-Meteo es un promedio de la hora anterior: los picos de corta duración pueden ser mayores.
- Manning con flujo supercrítico (Froude ≈ 2) y láminas de pocos centímetros es una aproximación.
- La estabilidad real de una persona depende de la edad, el calzado, los escombros y la visibilidad. El modelo no los incluye.

---

## 4. Notas de implementación (para Estiben)

**Firmas sugeridas** (constantes de zona en un solo lugar, por ejemplo `physics/constants.py`):

| Función | Entradas | Devuelve |
|---|---|---|
| `heat_index_c(temp_c, humidity)` | °C, % | HI en °C (sin redondear) |
| `thermal_risk(hi_c)` | °C | `"bajo"`, `"medio"` o `"alto"` |
| `pm25_risk(pm25)` | µg/m³ | `"bajo"`, `"medio"` o `"alto"` |
| `water_depth_cm(rain_mm_h, length_m=15000, n=0.016, slope=0.03)` | mm/h | cm |
| `flow_velocity_ms(rain_mm_h, length_m=15000, n=0.016, slope=0.03)` | mm/h | m/s |
| `drag_force_n(rain_mm_h, ..., person_width_m=0.5, cd=1.2, rho=1000)` | mm/h | N |
| `hydrology_risk(depth_cm, velocity_ms)` | cm, m/s | `"bajo"`, `"medio"` o `"alto"` |

**Puntos a cuidar:**

1. **Lluvia:** `rain_mm_h` debe estar en mm/h. En el bloque `current` de Open-Meteo, `precipitation` es la suma del intervalo anterior, no una tasa por hora. Si el intervalo (`current.interval`, en segundos) no es 3600, convertir: `rain_mm_h = precipitation * 3600 / interval`.
2. **Lluvia cero o negativa:** devolver profundidad, velocidad y fuerza = 0 (evita dividir entre cero en $v = q/h$).
3. **Humedad:** limitar a [0, 100]. Temperatura o PM2.5 ausentes → error de datos (502), no un valor inventado.
4. **Rama térmica:** el criterio es el promedio $(HI_s + T)/2$ contra 80 °F, no solo $HI_s$.
5. **Umbrales:** comparar con `<` y `<=` exactamente como en las secciones 1.4, 2.2 y 3.6.
6. **Redondeo:** solo al armar el JSON (1 decimal); nunca antes de clasificar.
7. **Pytest:** un archivo por módulo con las tablas 1.5, 2.4 y 3.7 (`pytest.approx` con las tolerancias indicadas).

---

## Apéndice A — Reproducir los cálculos en una hoja de cálculo

En Excel en español, cambiar `IF`→`SI`, `AND`→`Y`, `OR`→`O`, `SQRT`→`RAIZ` y usar `;` como separador.

### A.1 Térmico (entradas en B1 = T en °C, B2 = RH en %)

| Celda | Contenido | Fórmula |
|---|---|---|
| B3 | T en °F | `=B1*9/5+32` |
| B4 | HI simple | `=0.5*(B3+61+(B3-68)*1.2+B2*0.094)` |
| B5 | Promedio | `=(B3+B4)/2` |
| B6 | Rothfusz | `=-42.379+2.04901523*B3+10.14333127*B2-0.22475541*B3*B2-0.00683783*B3^2-0.05481717*B2^2+0.00122874*B3^2*B2+0.00085282*B3*B2^2-0.00000199*B3^2*B2^2` |
| B7 | Ajuste | `=IF(AND(B2<13,B3>=80,B3<=112),-((13-B2)/4)*SQRT((17-ABS(B3-95))/17),IF(AND(B2>85,B3>=80,B3<=87),((B2-85)/10)*((87-B3)/5),0))` |
| B8 | HI (°F) | `=IF(B5<80,B4,B6+B7)` |
| B9 | HI (°C) | `=(B8-32)*5/9` |
| B10 | Nivel | `=IF(B9<32.2,"bajo",IF(B9<39.4,"medio","alto"))` |

### A.2 Calidad del aire (B1 = PM2.5)

`=IF(B1<=15,"bajo",IF(B1<=37,"medio","alto"))`

### A.3 Hidrodinámico (B1 = lluvia en mm/h; B2 = L; B3 = n; B4 = S; B5 = w; B6 = Cd; B7 = ρ)

| Celda | Contenido | Fórmula |
|---|---|---|
| B8 | q (m²/s) | `=B1/3600000*B2` |
| B9 | h (m) | `=IF(B8=0,0,(B8*B3/SQRT(B4))^(3/5))` |
| B10 | v (m/s) | `=IF(B9=0,0,B8/B9)` |
| B11 | F (N) | `=0.5*B7*B5*B9*B6*B10^2` |
| B12 | h·v | `=B9*B10` |
| B13 | h·v² | `=B9*B10^2` |
| B14 | Nivel | `=IF(OR(B12>=0.4,B13>=1.23),"alto",IF(B12>=0.22,"medio","bajo"))` |

---

## Referencias

1. NOAA / National Weather Service, Weather Prediction Center. *The Heat Index Equation*. https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
2. Rothfusz, L. P. (1990). *The Heat Index Equation (or, More Than You Ever Wanted to Know About Heat Index)*. NWS Southern Region Technical Attachment SR 90-23.
3. Steadman, R. G. (1979). The assessment of sultriness. Part I. *Journal of Applied Meteorology*, 18, 861–873.
4. National Weather Service. *Heat Index Chart* (categorías Caution, Extreme Caution, Danger, Extreme Danger). https://www.weather.gov/safety/heat-index
5. Organización Mundial de la Salud (2021). *WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide*. Ginebra. ISBN 978-92-4-003422-8.
6. Ministerio de Ambiente y Desarrollo Sostenible de Colombia. *Resolución 2254 de 2017*, por la cual se adopta la norma de calidad del aire ambiente.
7. Cornare. *Boletín 2 — Calidad del Aire* (tabla del Índice de Calidad del Aire para PM2.5, 24 h).
8. Chow, V. T. (1959). *Open-Channel Hydraulics*. McGraw-Hill. (Coeficientes de Manning).
9. TxDOT. *Hydraulic Design Manual*, cap. 10, tabla 10-1 (n de Manning para calles y cunetas, basada en FHWA HEC-12/HEC-22).
10. Chow, V. T., Maidment, D. R. y Mays, L. W. (1988). *Applied Hydrology*. McGraw-Hill. (Método racional y coeficiente de escorrentía C).
11. David, L. M. y Carvalho, R. F. (2021). Designing for People's Safety on Flooded Streets. *Water*, 13(15), 2119. https://doi.org/10.3390/w13152119
12. Martínez-Gomariz, E., Gómez, M. y Russo, B. (2016). Experimental study of the stability of pedestrians exposed to urban pluvial flooding. *Natural Hazards*, 82, 1259.
13. Shand, T. D., Cox, R. J. y Blacka, M. J. (2011). *Development of Appropriate Criteria for the Safety and Stability of Persons and Vehicles in Floods*. 34th IAHR Congress, Brisbane.
14. Balmforth, D., Digman, C., Kellagher, R. y Butler, D. (2006). *Designing for Exceedance in Urban Drainage: Good Practice*. CIRIA C635. Nanía, L., Gómez, M. y Dolz, J. (2002), 9th ICUD.
15. Open-Meteo. *Weather Forecast API* y *Air Quality API* (documentación de variables). https://open-meteo.com/en/docs
