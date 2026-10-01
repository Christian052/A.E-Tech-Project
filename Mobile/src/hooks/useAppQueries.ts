import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../api/endpoints";
import { Service, SiteSettings, TrainingProgram, GalleryItem, User } from "../types";

export const queryKeys = {
  settings: ["settings"] as const,
  services: ["services"] as const,
  serviceDetail: (slug: string) => ["services", "detail", slug] as const,
  trainingPrograms: ["trainingPrograms"] as const,
  trainingProgramDetail: (id: string) => ["trainingPrograms", "detail", id] as const,
  gallery: (category?: string) => ["gallery", category || "all"] as const,
  testimonials: ["testimonials"] as const,
  userProfile: (userId?: string) => ["user", "profile", userId || "current"] as const,
  adminStats: ["admin", "stats"] as const,
};

/**
 * Hook to retrieve site settings (cached offline)
 */
export function useSiteSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => endpoints.getSettings(),
  });
}

/**
 * Hook to retrieve service requests & offerings (cached offline)
 */
export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: () => endpoints.getServices(),
  });
}

/**
 * Hook to retrieve specific service detail (cached offline)
 */
export function useServiceDetail(slug: string) {
  return useQuery({
    queryKey: queryKeys.serviceDetail(slug),
    queryFn: () => endpoints.getServiceBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to retrieve training programs (cached offline)
 */
export function useTrainingPrograms() {
  return useQuery({
    queryKey: queryKeys.trainingPrograms,
    queryFn: () => endpoints.getTrainingPrograms(),
  });
}

/**
 * Hook to retrieve gallery items (cached offline)
 */
export function useGallery(category?: string) {
  return useQuery({
    queryKey: queryKeys.gallery(category),
    queryFn: () => endpoints.getGallery(category),
  });
}

/**
 * Hook to retrieve current user profile data (cached offline)
 */
export function useUserProfile(userId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => endpoints.getCurrentUserProfile(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to retrieve admin statistics (cached offline)
 */
export function useAdminStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: () => endpoints.getAdminStats(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Mutation hook to update user profile and invalidate cache
 */
export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { name?: string; email?: string } }) =>
      endpoints.updateUserProfile(userId, data),
    onSuccess: (updatedUser, variables) => {
      // Update cache immediately
      queryClient.setQueryData(queryKeys.userProfile(variables.userId), updatedUser);
      queryClient.setQueryData(queryKeys.userProfile("current"), updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
    },
  });
}
