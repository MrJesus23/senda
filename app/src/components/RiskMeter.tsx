import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { RiskLevel } from '../types/api';

const LEVELS: RiskLevel[] = ['bajo', 'medio', 'alto'];

export function RiskMeter({ level }: { level: RiskLevel }) {
    const active = LEVELS.indexOf(level) + 1;
    const color = theme.risk[level].main;

    return (
        <View style={styles.meter}>
            {LEVELS.map((name, index) => (
                <View
                    key={name}
                    style={[
                        styles.segment,
                        { backgroundColor: index < active ? color : theme.colors.track },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    meter: { flexDirection: 'row' },
    segment: { width: 28, height: 6, borderRadius: 3, marginRight: 6 },
});