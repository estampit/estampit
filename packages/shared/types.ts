// Shared types and helpers
export interface LoyaltyCardSummary {
  id: string
  stampsRequired: number
  rewardDescription: string
}

export interface BusinessFeatures {
  plan_code: string
  promotions: boolean
  analytics_level: string
  api: boolean
  multi_location: boolean
}

export type StampEventSource = 'manual' | 'purchase' | 'qr';

export const FEATURE_FLAGS = {
  PROMOTIONS: 'promotions',
  MULTI_LOCATION: 'multi_location'
} as const
import { z } from 'zod'

// User types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

// Business types
export const BusinessSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  owner_id: z.string().uuid(),
  settings: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Business = z.infer<typeof BusinessSchema>

// Loyalty Card types
export const LoyaltyCardSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  stamps_required: z.number().int().positive(),
  reward_description: z.string().min(1),
  card_color: z.string().default('#667eea'),
  is_active: z.boolean().default(true),
  qr_code: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type LoyaltyCard = z.infer<typeof LoyaltyCardSchema>

// Customer Card types
export const CustomerCardSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  loyalty_card_id: z.string().uuid(),
  current_stamps: z.number().int().default(0),
  total_rewards_earned: z.number().int().default(0),
  last_stamp_at: z.string().datetime().optional(),
  is_completed: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type CustomerCard = z.infer<typeof CustomerCardSchema>

// Stamp types
export const StampSchema = z.object({
  id: z.string().uuid(),
  customer_card_id: z.string().uuid(),
  business_id: z.string().uuid(),
  stamp_method: z.enum(['qr_scan', 'nfc_tap', 'manual', 'automatic']),
  location: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
})

export type Stamp = z.infer<typeof StampSchema>

// Reward types
export const RewardSchema = z.object({
  id: z.string().uuid(),
  customer_card_id: z.string().uuid(),
  business_id: z.string().uuid(),
  reward_type: z.enum(['free_item', 'discount', 'points', 'custom']),
  reward_value: z.string(),
  is_redeemed: z.boolean().default(false),
  redeemed_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
})

export type Reward = z.infer<typeof RewardSchema>

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Common constants
export const STAMP_METHODS = {
  QR_SCAN: 'qr_scan',
  NFC_TAP: 'nfc_tap', 
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
} as const

export const REWARD_TYPES = {
  FREE_ITEM: 'free_item',
  DISCOUNT: 'discount',
  POINTS: 'points',
  CUSTOM: 'custom',
} as const

export const DEFAULT_CARD_COLORS = [
  '#667eea', // Purple
  '#f093fb', // Pink  
  '#4facfe', // Blue
  '#43e97b', // Green
  '#fa709a', // Rose
  '#ffecd2', // Orange
] as const