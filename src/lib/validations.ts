import { z } from "zod";

export const leadSchema = z.object({
  companyId: z.string().uuid(),
  customerName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  phone: z.string().min(7),
  serviceInterest: z.string().min(2),
  bookingDate: z.string().optional(),
  bookingTime: z.string().optional(),
  notes: z.string().max(1000).optional(),
  customFields: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
});

export const chatRequestSchema = z.object({
  companyId: z.string().min(2),
  sessionId: z.string().min(8),
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(4000)
      })
    )
    .max(20)
    .default([])
});

export const knowledgeSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(2),
  category: z.enum(["Company Info", "Services", "FAQ", "Pricing", "Policy", "Offer", "Location", "Hours"]),
  content: z.string().min(10),
  enabled: z.boolean().default(true)
});

export const bookingActionSchema = z.object({
  bookingId: z.string().uuid(),
  companyId: z.string().uuid(),
  reason: z.string().optional(),
  approvedDate: z.string().optional(),
  approvedTime: z.string().optional(),
  suggestedDate: z.string().optional(),
  suggestedTime: z.string().optional()
});
