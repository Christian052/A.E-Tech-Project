import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

/**
 * Configure the QueryClient with sensible caching defaults:
 * - Cache time (gcTime) of 24 hours so offline data remains available across sessions
 * - Stale time of 5 minutes so users get fresh data when connected without unnecessary refetches
 * - Retry behavior tuned for mobile connectivity drops
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes fresh window
      staleTime: 1000 * 60 * 5,
      // Keep inactive cache entries for 24 hours so offline access works seamlessly
      gcTime: 1000 * 60 * 60 * 24,
      // Retry twice on failure, with backoff
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

/**
 * Configure AsyncStorage persister for react-query-persist-client
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "AUGU_QUERY_OFFLINE_CACHE",
  throttleTime: 1000,
});
