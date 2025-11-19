import { z } from 'zod';
import {
  influencerSchema,
  createInfluencerInputSchema,
  updateInfluencerInputSchema,
  influencerListItemSchema,
  influencerListSchema,
  socialMediaSchema,
} from './influencer.schema';

// Infer types from schemas
export type Influencer = z.infer<typeof influencerSchema>;
export type CreateInfluencerInput = z.infer<typeof createInfluencerInputSchema>;
export type UpdateInfluencerInput = z.infer<typeof updateInfluencerInputSchema>;
export type InfluencerListItem = z.infer<typeof influencerListItemSchema>;
export type InfluencerList = z.infer<typeof influencerListSchema>;
export type SocialMedia = z.infer<typeof socialMediaSchema>;
