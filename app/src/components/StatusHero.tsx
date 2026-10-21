import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { RiskLevel } from '../types/api';

const VERDICT: Record<RiskLevel, string> = {
    bajo: 'Todo en orden',
    medio: 'Sal con precaución',
    alto: 'Hay riesgo en tu zona',
};

interface Props {
    level: RiskLevel;
    message: string;
    updatedAt: string;
    onRefresh: () => void;
}

export function StatusHero({ level, message, updatedAt, onRefresh }: Props) {
    const risk = theme.risk[level];

    return (
        <View style={[styles.hero, { backgroundColor: risk.soft }]}>
            <View style={styles.topRow}>
                <Text style={[styles.updated, { color: risk.ink }]}>Actualizado a las {updatedAt}</Text>
                <Pressable
                    onPress={onRefresh}
                    accessibilityRole="button"
                    accessibilityLabel="Actualizar alertas"
                    hitSlop={12}
                >
                    <Ionicons name="refresh-outline" size={22} color={risk.ink} />
                </Pressable>
            </View>

            <Text style={[styles.verdict, { color: risk.ink }]}>{VERDICT[level]}</Text>
            <Text style={[styles.message, { color: risk.ink }]}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        paddingTop: 56,
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 64,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    updated: { fontFamily: theme.font.regular, fontSize: 13 },
    verdict: {
        fontFamily: theme.font.bold,
        fontSize: 30,
        lineHeight: 34,
        marginTop: 28,
    },
    message: {
        fontFamily: theme.font.regular,
        fontSize: 15,
        lineHeight: 22,
        marginTop: 10,
    },
});