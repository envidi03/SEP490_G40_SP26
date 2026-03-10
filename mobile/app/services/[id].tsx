import { ServiceDetailScreen } from '@/src/screens/services/ServiceDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function ServiceDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <ServiceDetailScreen serviceId={id} />;
}
