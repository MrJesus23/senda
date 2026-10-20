import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Coordinates } from '../types/api';

type LocationStatus = 'loading' | 'ready' | 'denied' | 'error';

export function useLocation() {
    const [status, setStatus] = useState<LocationStatus>('loading');
    const [coords, setCoords] = useState<Coordinates | null>(null);

    const request = useCallback(async () => {
        setStatus('loading');
        try {
            const { status: permission } = await Location.requestForegroundPermissionsAsync();
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

    return { status, coords, retry: request };
}