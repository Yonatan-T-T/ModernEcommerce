import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider queries stale so endpoints are called on click & navigation
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
