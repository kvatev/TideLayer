export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  benefits: string[];
  process?: string[];
  cta: {
    label: string;
    href: string;
  };
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  problem: string;
  targetUsers: string[];
  benefits: string[];
  features: string[];
  howItWorks: string[];
  mockupDescription: string;
  cta: {
    label: string;
    href: string;
  };
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image: string;
  url?: string;
  isDemo: boolean;
  demoLabel?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  privacyConsent: boolean;
}

export interface InquiryType {
  id: string;
  label: string;
  description: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  isCTA?: boolean;
  dropdownItems?: NavigationItem[];
}

export interface Division {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  href: string;
  color: string;
  description: string;
  featured: boolean;
}

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}