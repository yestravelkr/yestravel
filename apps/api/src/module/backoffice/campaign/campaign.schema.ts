import { z } from 'zod';

// Main campaign schema
export const campaignSchema = z.object({
  id: z.number(),
  title: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  description: z.string().nullish(),
  thumbnail: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input schemas
export const createCampaignInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startAt: z.date(),
  endAt: z.date(),
  description: z.string().nullish(),
  thumbnail: z.string().nullish(),
});

export const updateCampaignInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').nullish(),
  startAt: z.date().nullish(),
  endAt: z.date().nullish(),
  description: z.string().nullish(),
  thumbnail: z.string().nullish(),
});

export const findCampaignByIdInputSchema = z.object({
  id: z.number(),
});

export const deleteCampaignInputSchema = z.object({
  id: z.number(),
});