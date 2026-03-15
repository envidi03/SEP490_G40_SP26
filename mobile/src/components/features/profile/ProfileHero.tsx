import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

type Props = {
    fullName: string;
    email: string;
    avatarUrl?: string;
};

export function ProfileHero({ fullName, email, avatarUrl }: Props) {
    return (
        <View style={styles.heroSection}>
            <View style={styles.avatarWrapper}>
                {avatarUrl ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                ) : (
                    <View style={styles.avatarFallback}>
                        <ThemedText style={styles.avatarInitial}>
                            {fullName.charAt(0).toUpperCase()}
                        </ThemedText>
                    </View>
                )}
            </View>
            <ThemedText style={styles.heroName}>{fullName}</ThemedText>
            <ThemedText style={styles.heroEmail}>{email}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    heroSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    avatarWrapper: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarInitial: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    heroName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    heroEmail: {
        fontSize: 15,
        color: '#6B7280',
    },
});
