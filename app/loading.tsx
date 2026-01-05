import { LoadingDots } from "@components/ui";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingDots></LoadingDots>
            <p>Loading...</p>

        </div>
    );
}