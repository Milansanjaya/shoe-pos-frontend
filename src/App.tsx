import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Router from './router';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,     // 1 minute
            retry: 1,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#111827',
                        border: '1px solid #374151',
                        color: '#f9fafb',
                    },
                }}
            />
        </QueryClientProvider>
    );
}
