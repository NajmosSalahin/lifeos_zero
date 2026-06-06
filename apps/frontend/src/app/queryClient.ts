import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5*60*1000, gcTime: 10*60*1000, retry: (n, e: any) => e?.response?.status===401||e?.response?.status===403 ? false : n < 2, refetchOnWindowFocus: false },
    mutations: { onError: (e: any) => { const msg = e?.response?.data?.error?.message || 'Something went wrong'; window.dispatchEvent(new CustomEvent('api-error', { detail: msg })); } },
  },
});
