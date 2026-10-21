import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Coordinates } from '../types/api';

type LocationStatus = 'loading' | 'ready' | 'denied' | 'error';

export function useLocation() {
  const [status, setStatus] = useState<LocationStatus>('loading');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const request = useCallback(async () => {
    setStatus('loading');
    try {
      const { status: permission, canAskAgain: again } =
        await Location.requestForegroundPermissionsAsync();
      setCanAskAgain(again);
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  // Si el usuario vuelve de Ajustes con el permiso activado, reintenta solo
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && status === 'denied') request();
    });
    return () => subscription.remove();
  }, [status, request]);

  return { status, coords, canAskAgain, retry: request };
}