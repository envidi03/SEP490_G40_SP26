import { BookingScreen } from '@/src/screens/booking/BookingScreen';
import { useLocalSearchParams } from 'expo-router';

export default function BookingPage() {
    // If we navigate here from a specific service or sub-service, pre-select it
    const { serviceId, subServiceId } = useLocalSearchParams<{ serviceId?: string; subServiceId?: string }>();

    return <BookingScreen initialServiceId={serviceId} initialSubServiceId={subServiceId} />;
}
