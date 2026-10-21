import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AlertRow } from '../components/AlertRow';
import { formatNumber } from '../utils/format';
import { StatusHero } from '../components/StatusHero';
import { useLocation } from '../hooks/useLocation';
import { getAlerts } from '../services/sendaApi';
import { theme } from '../theme';
import { AlertsResponse } from '../types/api';
import { getOverallRisk } from '../utils/risk';

function CenteredMessage({
    message,
    loading,
    onRetry,
}: {
    message: string;
    loading?: boolean;
    onRetry?: () => void;
}) {
    return (
        <View style={styles.center}>
            {loading && <ActivityIndicator size="large" style={styles.spinner} />}
            <Text style={styles.centerText}>{message}</Text>
            {onRetry && <Button title="Reintentar" onPress={onRetry} />}
        </View>
    );
}

export function DashboardScreen() {
    const { status, coords, retry } = useLocation();
    const [data, setData] = useState<AlertsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        async (isRefresh = false) => {
            if (!coords) return;
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
            try {
                setData(await getAlerts(coords.lat, coords.lon));
            } catch {
                setError('No pudimos obtener las alertas. Revisa tu conexión e intenta de nuevo.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [coords],
    );

    useEffect(() => {
        load();
    }, [load]);

    if (status === 'loading') {
        return <CenteredMessage loading message="Obteniendo tu ubicación…" />;
    }
    if (status === 'denied') {
        return (
            <CenteredMessage
                message="Necesitamos tu ubicación para calcular las alertas de tu zona."
                onRetry={retry}
            />
        );
    }
    if (status === 'error') {
        return <CenteredMessage message="No pudimos obtener tu ubicación." onRetry={retry} />;
    }
    if (!data && loading) {
        return <CenteredMessage loading message="Calculando alertas…" />;
    }
    if (!data) {
        return <CenteredMessage message={error ?? 'Sin datos por ahora.'} onRetry={() => load()} />;
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
        backgroundColor: theme.risk.alto.soft,
        color: theme.risk.alto.ink,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.md,
        fontSize: 14,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    spinner: { marginBottom: theme.spacing.md },
    centerText: {
        fontSize: 16,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
});