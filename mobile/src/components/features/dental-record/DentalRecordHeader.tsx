import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

export function DentalRecordHeader() {
    return (
        <View style={styles.header}>
            <View>
                <ThemedText style={styles.label}>Phòng khám</ThemedText>
                <ThemedText style={styles.title}>Hồ sơ nha khoa</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 4,
    },
    label: {
        fontSize: 13,
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
        paddingTop: 10,
    },
});
