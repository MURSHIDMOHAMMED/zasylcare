export type Company = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  primaryColor: string;
  supportEmail?: string | null;
  phone?: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanyKnowledge = {
  id: string;
  companyId: string;
  title: string;
  category: "Company Info" | "Services" | "FAQ" | "Pricing" | "Policy" | "Offer" | "Location" | "Hours";
  content: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};
