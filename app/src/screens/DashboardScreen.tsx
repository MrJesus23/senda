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
import { AlertCard } from '../components/AlertCard';
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
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    sheet: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.sheet,
        borderTopRightRadius: theme.radius.sheet,
        marginTop: -theme.radius.sheet,
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        minHeight: 480,
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