# SENDA

**Sistema de Evaluación Natural y Dinámica de la Atmósfera**

App móvil que traduce datos meteorológicos en alertas de impacto físico para quien se mueve por el Valle de Aburrá: qué tan intenso es el calor, qué tan limpio está el aire y qué tan peligrosa es la lluvia sobre las calles. Cada alerta se calcula con modelos de termodinámica, mecánica de fluidos e hidrodinámica, y se muestra en lenguaje cotidiano.

Proyecto de aula de Física, 2026-II. Facultad de Ingeniería, Institución Universitaria Tecnológico de Antioquia.

<!-- Agrega aquí 2 o 3 capturas de la app cuando las tengas:
<p>
  <img src="docs/img/dashboard.png" width="240" alt="Pantalla principal de SENDA" />
</p>
-->

## El problema

Medellín tiene microclimas complejos, episodios de mala calidad del aire y lluvias intensas que se vuelven escorrentía en minutos. Los datos meteorológicos existen, pero en bruto (grados, milímetros, microgramos) son difíciles de interpretar. SENDA responde una pregunta simple: **¿qué tan seguro es moverme hoy en mi zona?**

## Cómo funciona

```
Open-Meteo (clima y calidad del aire)
        │
        ▼
Backend en Python (FastAPI) ── aplica las fórmulas físicas
        │   GET /api/v1/alerts?lat=..&lon=..
        ▼
App móvil (React Native + Expo) ── solo muestra los resultados
```

Regla central del diseño: **la app no hace cálculos físicos.** Toda la física vive en el backend, en funciones puras que se prueban de forma aislada. La app pide las alertas ya calculadas y las presenta.

## Las tres alertas

Cada módulo entrega un valor y un nivel de riesgo (`bajo`, `medio` o `alto`). Fórmulas, fuentes y casos de prueba completos en [`docs/fisica.md`](docs/fisica.md).

| Módulo | Qué calcula | Umbrales de riesgo |
|---|---|---|
| Sensación térmica | Índice de calor (procedimiento de NOAA) a partir de temperatura y humedad | Bajo < 32,2 °C. Medio de 32,2 a 39,4 °C. Alto desde 39,4 °C |
| Calidad del aire | Concentración de partículas PM2.5 | Bajo hasta 15 µg/m³. Medio hasta 37 µg/m³. Alto por encima de 37 µg/m³ |
| Lluvia en las calles | Altura y velocidad del agua de escorrentía (ecuación de Manning) y fuerza de arrastre sobre una persona | Bajo h·v < 0,22 m²/s. Medio de 0,22 a 0,40 m²/s. Alto desde 0,40 m²/s o fuerza de arrastre desde 369 N |

Los mensajes que ve el usuario para cada nivel están en [`docs/mensajes.md`](docs/mensajes.md).

## Estructura del repositorio

```
senda/
├── backend/     API en Python (FastAPI) y módulo de física
├── app/         App móvil (React Native, Expo, TypeScript)
└── docs/        Fórmulas físicas, mensajes de alerta y contrato de la API
```

## Cómo ejecutarlo

### Backend

Requiere Python 3.11 o superior.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La documentación interactiva queda en `http://127.0.0.1:8000/docs`. Para correr las pruebas de la física: `pytest`.

El backend está desplegado en Render (plan gratuito): https://senda-backend-ssjo.onrender.com. Si lleva un rato sin uso, la primera respuesta puede tardar cerca de un minuto en despertar.

### App

Requiere Node.js y la app **Expo Go** en el celular (versión compatible con Expo SDK 57).

```bash
cd app
npm install
cp .env.example .env             # en Windows: copy .env.example .env
npx expo start -c
```

Escanea el código QR con Expo Go. Las variables de entorno solo se leen al arrancar, por eso el `-c`.

| Variable | Qué hace |
|---|---|
| `EXPO_PUBLIC_API_URL` | Dirección del backend, sin barra al final |
| `EXPO_PUBLIC_USE_MOCK` | Con valor `true` (o sin dirección de backend) la app usa datos simulados |

## API

`GET /api/v1/alerts?lat={latitud}&lon={longitud}`

Ejemplo de respuesta:

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

El contrato completo (campos, unidades y errores) está en [`docs/api-contract.md`](docs/api-contract.md). Las respuestas se guardan en caché por 10 minutos para cada zona.

## Limitaciones conocidas

- **Modelo de lluvia simplificado.** La escorrentía usa una longitud equivalente de aporte (área que drena hacia la calle dividida entre su ancho) que es un parámetro calibrado, no una medición. Detalles en la sección 3 de [`docs/fisica.md`](docs/fisica.md).
- **PM2.5.** Se compara un valor horario contra umbrales pensados para promedios de 24 horas.
- **Sin validación con mediciones reales.** Los resultados se contrastaron con casos calculados a mano, no con observaciones en calle.
- **Servidor gratuito.** La primera consulta tras un rato de inactividad es lenta.

## Trabajo futuro

- Mapa de precipitación del Valle de Aburrá, inspirado en el radar de SIATA.
- Registro de usuarios por organización, con base de datos (Supabase es la opción considerada).
- Modelo completo de dispersión de contaminantes con gradiente térmico e inversión térmica.
- Pendiente topográfica real para el cálculo de escorrentía.
- Modo oscuro según el tema del sistema, notificaciones push e histórico de alertas.

## Equipo

| Integrante | Rol |
|---|---|
| Jesús Daniel Bustamante Gómez | Frontend y liderazgo técnico |
| Estiben López García | Backend |
| Camilo Andrés Fuentes Sánchez | Modelos físicos y validación |
| Kelly Yohana García Arroyave | Documentación, pruebas y presentación |


## Flujo de trabajo

La rama `main` es la versión estable. Cada tarea se hace en su propia rama (`feat/...`, `fix/...`, `docs/...`) y se une mediante Pull Request revisado por otra persona del equipo.
