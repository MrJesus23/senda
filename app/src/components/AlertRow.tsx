import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { RiskLevel } from '../types/api';
import { RiskMeter } from './RiskMeter';

interface Detail {
    label: string;
    value: string;
}

interface Props {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    unit: string;
    riskLevel: RiskLevel;
    message: string;
    details?: Detail[];
    isLast?: boolean;
}

export function AlertRow({
    title,
    subtitle,
    icon,
    value,
    unit,
    riskLevel,
    message,
    details,
    isLast,
}: Props) {
    const risk = theme.risk[riskLevel];

    return (
        <View style={[styles.row, !isLast && styles.divider]}>
            <View style={styles.header}>
                <View style={styles.titleWrap}>
                    <View style={[styles.iconWrap, { backgroundColor: risk.soft }]}>
                        <Ionicons name={icon} size={20} color={risk.ink} />
                    </View>
                    <View style={styles.titleText}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>
                </View>
                <View style={styles.valueWrap}>
                    <Text style={styles.value}>{value}</Text>
                    <Text style={styles.unit}>{unit}</Text>
                </View>
            </View>

            <View style={styles.meterRow}>
                <RiskMeter level={riskLevel} />
                <Text style={[styles.riskLabel, { color: risk.ink }]}>{risk.label}</Text>
            </View>

            <Text style={styles.message}>{message}</Text>

            {details && (
                <View style={styles.details}>
                    {details.map((detail) => (
                        <View key={detail.label} style={styles.detail}>
                            <Text style={styles.detailLabel}>{detail.label}</Text>
                            <Text style={styles.detailValue}>{detail.value}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { paddingVertical: 20 },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    titleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    titleText: { flex: 1 },
    title: { fontFamily: theme.font.semibold, fontSize: 16, color: theme.colors.text },
    subtitle: { fontFamily: theme.font.regular, fontSize: 12, color: theme.colors.textMuted },
    valueWrap: { flexDirection: 'row', alignItems: 'baseline', marginLeft: 12 },
    value: { fontFamily: theme.font.bold, fontSize: 28, lineHeight: 32, color: theme.colors.text },
    unit: {
        fontFamily: theme.font.regular,
        fontSize: 13,
        color: theme.colors.textMuted,
        marginLeft: 4,
    },
    meterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
    riskLabel: { fontFamily: theme.font.semibold, fontSize: 13, marginLeft: 10 },
    message: {
        fontFamily: theme.font.regular,
        fontSize: 14,
        lineHeight: 21,
        color: theme.colors.textMuted,
        marginTop: 8,
    },
    details: { flexDirection: 'row', marginTop: 14 },
    detail: { marginRight: 32 },
    detailLabel: { fontFamily: theme.font.regular, fontSize: 12, color: theme.colors.textMuted },
    detailValue: {
        fontFamily: theme.font.semibold,
        fontSize: 16,
        color: theme.colors.text,
        marginTop: 2,
    },
});