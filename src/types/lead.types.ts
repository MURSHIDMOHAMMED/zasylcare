import type { LeadStatus } from "@/constants/statuses";

export type Lead = {
  id: string;
  companyId: string;
  customerName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  bookingDate?: string | null;
  bookingTime?: string | null;
  leadSource: "Chatbot" | "Admin" | "API" | "Import";
  leadScore: number;
  status: LeadStatus;
  notes?: string | null;
  customFields?: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
};

export type LeadMessage = {
  id: string;
  leadId?: string | null;
  companyId: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};
