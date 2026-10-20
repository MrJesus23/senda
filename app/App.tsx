import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text } from 'react-native';
import { getAlerts } from './src/services/sendaApi';
import { AlertsResponse } from './src/types/api';

export default function App() {
  const [data, setData] = useState<AlertsResponse | null>(null);

  useEffect(() => {
    getAlerts(6.2442, -75.5812).then(setData);
  }, []);

  if (!data) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </ScrollView>
  );
}