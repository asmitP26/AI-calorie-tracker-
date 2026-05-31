import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                const message = error instanceof Error ? error.message.toLowerCase() : ''
                if (message.includes('fetch') || message.includes('network')) return false
                return failureCount < 2
            },
            staleTime: 30_000,
            gcTime: 5 * 60_000,
        },
    },
})
