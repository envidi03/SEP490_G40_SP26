import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

type Props = {
    profile: any;
    totalVisits: number;
    lastVisitDate?: string;
};

export function PatientSummaryCard({ profile, totalVisits, lastVisitDate }: Props) {
    const fullName = profile?.full_name || 'Chưa cập nhật';
    const avatarUrl = profile?.avatar_url;

    let lastVisitDisplay = 'Chưa có lần khám nào';
    try {
        if (lastVisitDate) {
            const d = typeof lastVisitDate === 'string' ? parseISO(lastVisitDate) : new Date(lastVisitDate);
            lastVisitDisplay = format(d, 'dd/MM/yyyy', { locale: vi });
        }
    } catch (e) { console.log(e); }

    return (
        <View style={styles.card}>
            {/* Patient Identity */}
            <View style={styles.identity}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
                ) : (
                    <View style={styles.avatarFallback}>
                        <ThemedText style={styles.avatarInitial}>{fullName.charAt(0).toUpperCase()}</ThemedText>
                    </View>
                )}
                <View style={styles.identityInfo}>
                    <ThemedText style={styles.patientName}>{fullName}</ThemedText>
                    <ThemedText style={styles.patientLabel}>Bệnh nhân</ThemedText>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                    <ThemedText style={styles.statValue}>{totalVisits}</ThemedText>
                    <ThemedText style={styles.statLabel}>Lần khám</ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBlock}>
                    <ThemedText style={styles.statValue} numberOfLines={1}>{lastVisitDisplay}</ThemedText>
                    <ThemedText style={styles.statLabel}>Lần khám gần nhất</ThemedText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E3A5F',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    identity: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarFallback: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarInitial: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    identityInfo: {
        marginLeft: 16,
    },
    patientName: {
        fontSize: 19,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    patientLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statBlock: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
});
