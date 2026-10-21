import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
    title: string;
    body?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    primaryLabel?: string;
    onPrimary?: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
}

export function StateScreen({
    title,
    body,
    icon,
    loading,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
}: Props) {
    return (
        <View style={styles.screen}>
            <View style={styles.iconWrap}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.text} />
                ) : (
                    icon && <Ionicons name={icon} size={32} color={theme.colors.text} />
                )}
            </View>

            <Text style={styles.title}>{title}</Text>
            {body && <Text style={styles.body}>{body}</Text>}

            {primaryLabel && onPrimary && (
                <Pressable
                    onPress={onPrimary}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
                >
                    <Text style={styles.primaryText}>{primaryLabel}</Text>
                </Pressable>
            )}

            {secondaryLabel && onSecondary && (
                <Pressable onPress={onSecondary} accessibilityRole="button" hitSlop={8}>
                    <Text style={styles.secondaryText}>{secondaryLabel}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },
    iconWrap: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: theme.colors.track,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontFamily: theme.font.bold,
        fontSize: 22,
        lineHeight: 28,
        color: theme.colors.text,
        textAlign: 'center',
    },
    body: {
        fontFamily: theme.font.regular,
        fontSize: 15,
        lineHeight: 22,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
        maxWidth: 300,
    },
    primary: {
        backgroundColor: theme.colors.text,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 28,
        marginTop: theme.spacing.lg,
    },
    pressed: { opacity: 0.85 },
    primaryText: { fontFamily: theme.font.semibold, fontSize: 15, color: theme.colors.surface },
    secondaryText: {
        fontFamily: theme.font.semibold,
        fontSize: 14,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.md,
    },
});