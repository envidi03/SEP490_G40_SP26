import { SubServiceDetailScreen } from '@/src/screens/services/SubServiceDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function SubServiceDetailPage() {
    const { subId } = useLocalSearchParams<{ subId: string }>();
    return <SubServiceDetailScreen subServiceId={subId} />;
}
