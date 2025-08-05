import { z } from 'zod';

// Main campaign schema
export const campaignSchema = z.object({
  id: z.number(),
  title: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input schemas
export const createCampaignInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startAt: z.date(),
  endAt: z.date(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
});

export const updateCampaignInputSchema = createCampaignInputSchema.extend({
  id: z.number(),
}).partial().required({ id: true });

export const findCampaignByIdInputSchema = z.object({
  id: z.number(),
});

export const deleteCampaignInputSchema = z.object({
  id: z.number(),
});