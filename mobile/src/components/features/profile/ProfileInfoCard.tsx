import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

export type InfoItem = {
    label: string;
    value: string;
};

type Props = {
    title: string;
    items: InfoItem[];
};

export function ProfileInfoCard({ title, items }: Props) {
    return (
        <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>{title}</ThemedText>
            {items.map((item, index) => (
                <View
                    key={item.label}
                    style={[
                        styles.infoRow,
                        index === items.length - 1 && styles.infoRowLast,
                    ]}
                >
                    <ThemedText style={styles.infoLabel}>{item.label}</ThemedText>
                    <ThemedText style={styles.infoValue} numberOfLines={2}>
                        {item.value}
                    </ThemedText>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoRowLast: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    infoLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        flex: 2,
        textAlign: 'right',
    },
});
