import { BookingScreen } from '@/src/screens/booking/BookingScreen';
import { useLocalSearchParams } from 'expo-router';

export default function BookingPage() {
    // If we navigate here from a specific service, we can pre-select it using serviceId
    const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();

    return <BookingScreen initialServiceId={serviceId} />;
}
