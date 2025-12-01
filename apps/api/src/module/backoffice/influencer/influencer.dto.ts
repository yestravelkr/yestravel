import { z } from 'zod';
import {
  influencerSchema,
  createInfluencerInputSchema,
  updateInfluencerInputSchema,
  influencerListItemSchema,
  influencerListSchema,
  socialMediaSchema,
} from './influencer.schema';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';

// Infer types from schemas
export type Influencer = z.infer<typeof influencerSchema>;
export type CreateInfluencerInput = z.infer<typeof createInfluencerInputSchema>;
export type UpdateInfluencerInput = z.infer<typeof updateInfluencerInputSchema>;
export type InfluencerListItem = z.infer<typeof influencerListItemSchema>;
export type InfluencerList = z.infer<typeof influencerListSchema>;
export type SocialMedia = z.infer<typeof socialMediaSchema>;

// List response type (Entity 배열)
export interface InfluencerListResponse {
  data: InfluencerEntity[];
  total: number;
}
