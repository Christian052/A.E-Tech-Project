export interface Service {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  features?: string[];
  icon?: string;
  image?: string;
  pricingInfo?: string;
  active: boolean;
}

export interface TrainingProgram {
  _id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  schedule?: string;
  level?: string;
  curriculum?: string[];
  internshipIncluded?: boolean;
  price?: number;
  featured?: boolean;
  active: boolean;
}

export interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  createdAt?: string;
}

export interface Testimonial {
  _id: string;
  clientName: string;
  clientRole?: string;
  company?: string;
  message: string;
  rating: number;
}

export interface SiteSettings {
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  operatingHours: string;
  aboutText?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
