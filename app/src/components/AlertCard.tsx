import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { RiskLevel } from '../types/api';

interface Detail {
    label: string;
    value: string;
}

interface Props {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    unit: string;
    riskLevel: RiskLevel;
    message: string;
    details?: Detail[];
}

export function AlertCard({ title, icon, value, unit, riskLevel, message, details }: Props) {
    const risk = theme.risk[riskLevel];

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.iconWrap, { backgroundColor: risk.soft }]}>
                    <Ionicons name={icon} size={20} color={risk.main} />
                </View>
                <Text style={styles.title}>{title}</Text>
                <View style={[styles.badge, { backgroundColor: risk.soft }]}>
                    <Text style={[styles.badgeText, { color: risk.main }]}>{risk.label}</Text>
                </View>
            </View>

            <View style={styles.valueRow}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>

            <Text style={styles.message}>{message}</Text>

            {details && (
                <View style={styles.details}>
                    {details.map((d) => (
                        <View key={d.label} style={styles.detail}>
                            <Text style={styles.detailLabel}>{d.label}</Text>
                            <Text style={styles.detailValue}>{d.value}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    title: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.colors.text },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    valueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: theme.spacing.sm },
    value: { fontSize: 44, fontWeight: '700', color: theme.colors.text, lineHeight: 48 },
    unit: { fontSize: 16, color: theme.colors.textMuted, marginLeft: 6, marginBottom: 6 },
    message: { fontSize: 15, color: theme.colors.textMuted, lineHeight: 22 },
    details: {
        flexDirection: 'row',
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    detail: { flex: 1 },
    detailLabel: { fontSize: 12, color: theme.colors.textMuted },
    detailValue: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
});