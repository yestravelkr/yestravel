import { z } from 'zod';
import {
  campaignSchema,
  createCampaignInputSchema,
  updateCampaignInputSchema,
  findCampaignByIdInputSchema,
  deleteCampaignInputSchema,
} from './campaign.schema';

// Inferred types from Zod schemas
export type Campaign = z.infer<typeof campaignSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignInputSchema>;
export type FindCampaignByIdInput = z.infer<typeof findCampaignByIdInputSchema>;
export type DeleteCampaignInput = z.infer<typeof deleteCampaignInputSchema>;