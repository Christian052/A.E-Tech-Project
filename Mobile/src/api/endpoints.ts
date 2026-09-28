import api from "./client";
import { Service, TrainingProgram, GalleryItem, Testimonial, SiteSettings, User } from "../types";

export const endpoints = {
  // Site settings & contacts
  getSettings: async (): Promise<SiteSettings> => {
    const res = await api.get("/settings");
    return res.data?.data || res.data;
  },

  // Services
  getServices: async (): Promise<Service[]> => {
    const res = await api.get("/services");
    return res.data?.data || res.data;
  },
  getServiceBySlug: async (slug: string): Promise<Service> => {
    const res = await api.get(`/services/${slug}`);
    return res.data?.data || res.data;
  },

  // Training Programs
  getTrainingPrograms: async (): Promise<TrainingProgram[]> => {
    const res = await api.get("/training-programs");
    return res.data?.data || res.data;
  },
  getTrainingProgramById: async (id: string): Promise<TrainingProgram> => {
    const res = await api.get(`/training-programs/${id}`);
    return res.data?.data || res.data;
  },
  submitApplication: async (payload: {
    fullName: string;
    email: string;
    phone: string;
    programId: string;
    educationLevel?: string;
    motivation?: string;
  }) => {
    const res = await api.post("/applications", payload);
    return res.data;
  },

  // Gallery
  getGallery: async (category?: string): Promise<GalleryItem[]> => {
    const params = category && category !== "all" ? { category } : {};
    const res = await api.get("/gallery", { params });
    return res.data?.data || res.data;
  },

  // Testimonials
  getTestimonials: async (): Promise<Testimonial[]> => {
    const res = await api.get("/testimonials");
    return res.data?.data || res.data;
  },

  // Contact & Inquiries
  submitContact: async (payload: {
    name: string;
    email?: string;
    phone: string;
    serviceInterest?: string;
    message: string;
  }) => {
    const res = await api.post("/contact", payload);
    return res.data;
  },

  // User & Profile Management
  getCurrentUserProfile: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return res.data?.user || res.data;
  },

  updateUserProfile: async (userId: string, data: { name?: string; email?: string }): Promise<User> => {
    const res = await api.patch(`/users/${userId}`, data);
    return res.data?.user || res.data;
  },

  updateUserPassword: async (userId: string, password: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.patch(`/users/${userId}/password`, { password });
    return res.data;
  },

  // Admin / Stats
  getAdminStats: async () => {
    const [inquiries, applications, services, users] = await Promise.allSettled([
      api.get("/contact"),
      api.get("/applications"),
      api.get("/services"),
      api.get("/users"),
    ]);

    return {
      inquiriesCount: inquiries.status === "fulfilled" ? inquiries.value.data?.length || 0 : 0,
      applicationsCount: applications.status === "fulfilled" ? applications.value.data?.length || 0 : 0,
      servicesCount: services.status === "fulfilled" ? services.value.data?.length || 0 : 0,
      usersCount: users.status === "fulfilled" ? users.value.data?.length || 0 : 0,
    };
  },
};
