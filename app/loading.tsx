import { LoadingDots } from "@components/ui";
import { Container, Text } from '@components/ui';

export default function Loading() {
    return (
        <div className="space-y-10 text-center bg-background py-20">
            <LoadingDots />
            <Text className='ml-2'>Loading</Text>
        </div>
    );
}