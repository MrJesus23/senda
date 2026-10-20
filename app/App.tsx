import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertCard } from './src/components/AlertCard';
import { useLocation } from './src/hooks/useLocation';
import { getAlerts } from './src/services/sendaApi';
import { theme } from './src/theme';
import { AlertsResponse } from './src/types/api';

export default function App() {
  const { status, coords, retry } = useLocation();
  const [data, setData] = useState<AlertsResponse | null>(null);

  useEffect(() => {
    if (coords) {
      getAlerts(coords.lat, coords.lon).then(setData);
    }
  }, [coords]);

  if (status === 'denied' || status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>
          {status === 'denied'
            ? 'Necesitamos tu ubicación para calcular las alertas de tu zona.'
            : 'No pudimos obtener tu ubicación.'}
        </Text>
        <Button title="Reintentar" onPress={retry} />
      </View>
    );
  }

  if (!data) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AlertCard
        title="Confort térmico"
        icon="thermometer-outline"
        value={data.thermal.heat_index_c.toFixed(1)}
        unit="°C"
        riskLevel={data.thermal.risk_level}
        message={data.thermal.message}
      />
      <AlertCard
        title="Calidad del aire"
        icon="cloud-outline"
        value={data.air_quality.pm25_ugm3.toFixed(1)}
        unit="µg/m³ PM2.5"
        riskLevel={data.air_quality.risk_level}
        message={data.air_quality.message}
      />
      <AlertCard
        title="Escorrentía"
        icon="water-outline"
        value={data.hydrology.rain_mm_h.toFixed(0)}
        unit="mm/h de lluvia"
        riskLevel={data.hydrology.risk_level}
        message={data.hydrology.message}
        details={[
          { label: 'Altura del agua', value: `${data.hydrology.water_depth_cm.toFixed(1)} cm` },
          { label: 'Fuerza de arrastre', value: `${data.hydrology.drag_force_n.toFixed(0)} N` },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 64 },
  loader: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  centerText: { fontSize: 16, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.md },
});