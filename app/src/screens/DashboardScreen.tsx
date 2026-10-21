import { useCallback, useEffect, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertRow } from '../components/AlertRow';
import { StateScreen } from '../components/StateScreen';
import { StatusHero } from '../components/StatusHero';
import { useLocation } from '../hooks/useLocation';
import { getAlerts } from '../services/sendaApi';
import { theme } from '../theme';
import { AlertsResponse } from '../types/api';
import { formatNumber } from '../utils/format';
import { getOverallRisk } from '../utils/risk';

export function DashboardScreen() {
    const { status, coords, retry } = useLocation();
    const [data, setData] = useState<AlertsResponse | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [slow, setSlow] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        async (isRefresh = false) => {
            if (!coords) return;
            if (isRefresh) setRefreshing(true);
            setError(null);
            const slowTimer = setTimeout(() => setSlow(true), 6000);
            try {
                setData(await getAlerts(coords.lat, coords.lon));
            } catch {
                setError('No pudimos actualizar las alertas. Revisa tu conexión e inténtalo de nuevo.');
            } finally {
                clearTimeout(slowTimer);
                setSlow(false);
                setRefreshing(false);
            }
        },
        [coords],
    );

    useEffect(() => {
        load();
    }, [load]);

    if (status === 'loading') {
        return <StateScreen loading title="Buscando tu ubicación" />;
    }

    if (status === 'denied') {
        return (
            <StateScreen
                icon="location-outline"
                title="Necesitamos tu ubicación"
                body="SENDA calcula las alertas de la zona donde estás. Activa el permiso de ubicación para continuar."
                primaryLabel="Permitir ubicación"
                onPrimary={retry}
                secondaryLabel="Abrir ajustes"
                onSecondary={() => Linking.openSettings()}
            />
        );
    }

    if (status === 'error') {
        return (
            <StateScreen
                icon="navigate-outline"
                title="No pudimos obtener tu ubicación"
                body="Revisa que el GPS esté activado e inténtalo de nuevo."
                primaryLabel="Reintentar"
                onPrimary={retry}
            />
        );
    }

    if (!data && error) {
        return (
            <StateScreen
                icon="cloud-offline-outline"
                title="No pudimos cargar las alertas"
                body="Revisa tu conexión e inténtalo de nuevo."
                primaryLabel="Reintentar"
                onPrimary={() => load()}
            />
        );
    }

    if (!data) {
        return (
            <StateScreen
                loading
                title={slow ? 'Despertando el servidor' : 'Calculando las alertas de tu zona'}
                body={slow ? 'La primera vez puede tardar hasta un minuto.' : undefined}
            />
        );
    }

    const updatedAt = new Date(data.calculated_at).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const overall = getOverallRisk(data);

    return (
        <ScrollView
            style={styles.screen}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        >
            <StatusHero
                level={overall.level}
                message={overall.message}
                updatedAt={updatedAt}
                onRefresh={() => load(true)}
            />

            <View style={styles.sheet}>
                {error && <Text style={styles.errorBanner}>{error}</Text>}

                <AlertRow
                    title="Sensación térmica"
                    subtitle="Índice de calor"
                    icon="thermometer-outline"
                    value={formatNumber(data.thermal.heat_index_c, 1)}
                    unit="°C"
                    riskLevel={data.thermal.risk_level}
                    message={data.thermal.message}
                />
                <AlertRow
                    title="Calidad del aire"
                    subtitle="Partículas PM2.5"
                    icon="cloud-outline"
                    value={formatNumber(data.air_quality.pm25_ugm3, 1)}
                    unit="µg/m³"
                    riskLevel={data.air_quality.risk_level}
                    message={data.air_quality.message}
                />
                <AlertRow
                    title="Lluvia en las calles"
                    subtitle="Escorrentía superficial"
                    icon="rainy-outline"
                    value={formatNumber(data.hydrology.rain_mm_h, 0)}
                    unit="mm/h"
                    riskLevel={data.hydrology.risk_level}
                    message={data.hydrology.message}
                    details={[
                        { label: 'Altura del agua', value: `${formatNumber(data.hydrology.water_depth_cm, 1)} cm` },
                        { label: 'Fuerza de arrastre', value: `${formatNumber(data.hydrology.drag_force_n, 0)} N` },
                    ]}
                    isLast
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    sheet: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.sheet,
        borderTopRightRadius: theme.radius.sheet,
        marginTop: -theme.radius.sheet,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.xl,
        minHeight: 520,
    },
    errorBanner: {
        fontFamily: theme.font.regular,
        backgroundColor: theme.risk.alto.soft,
        color: theme.risk.alto.ink,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        marginTop: theme.spacing.md,
        fontSize: 14,
    },
});