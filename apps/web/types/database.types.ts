export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      business_locations: {
        Row: {
          address: string | null
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          metadata: Json
          name: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          name: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          name?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_staff: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          staff_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          staff_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_stats: {
        Row: {
          active_loyalty_cards: number
          business_id: string
          last_refresh: string
          total_customers: number
          total_promotions_active: number
          total_rewards: number
          total_stamps: number
          updated_at: string
        }
        Insert: {
          active_loyalty_cards?: number
          business_id: string
          last_refresh?: string
          total_customers?: number
          total_promotions_active?: number
          total_rewards?: number
          total_stamps?: number
          updated_at?: string
        }
        Update: {
          active_loyalty_cards?: number
          business_id?: string
          last_refresh?: string
          total_customers?: number
          total_promotions_active?: number
          total_rewards?: number
          total_stamps?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_stats_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          external_reference: string | null
          id: string
          metadata: Json
          plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end: string
          current_period_start?: string
          external_reference?: string | null
          id?: string
          metadata?: Json
          plan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          external_reference?: string | null
          id?: string
          metadata?: Json
          plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          settings: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_cards: {
        Row: {
          created_at: string
          current_stamps: number | null
          customer_id: string
          id: string
          is_completed: boolean | null
          last_stamp_at: string | null
          loyalty_card_id: string
          metadata: Json | null
          total_rewards_earned: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stamps?: number | null
          customer_id: string
          id?: string
          is_completed?: boolean | null
          last_stamp_at?: string | null
          loyalty_card_id: string
          metadata?: Json | null
          total_rewards_earned?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stamps?: number | null
          customer_id?: string
          id?: string
          is_completed?: boolean | null
          last_stamp_at?: string | null
          loyalty_card_id?: string
          metadata?: Json | null
          total_rewards_earned?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_cards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_cards_loyalty_card_id_fkey"
            columns: ["loyalty_card_id"]
            isOneToOne: false
            referencedRelation: "loyalty_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actor_id: string | null
          business_id: string | null
          created_at: string
          customer_card_id: string | null
          customer_id: string | null
          event_type: string
          id: string
          loyalty_card_id: string | null
          metadata: Json
          promotion_id: string | null
          reward_id: string | null
        }
        Insert: {
          actor_id?: string | null
          business_id?: string | null
          created_at?: string
          customer_card_id?: string | null
          customer_id?: string | null
          event_type: string
          id?: string
          loyalty_card_id?: string | null
          metadata?: Json
          promotion_id?: string | null
          reward_id?: string | null
        }
        Update: {
          actor_id?: string | null
          business_id?: string | null
          created_at?: string
          customer_card_id?: string | null
          customer_id?: string | null
          event_type?: string
          id?: string
          loyalty_card_id?: string | null
          metadata?: Json
          promotion_id?: string | null
          reward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_customer_card_id_fkey"
            columns: ["customer_card_id"]
            isOneToOne: false
            referencedRelation: "customer_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_loyalty_card_id_fkey"
            columns: ["loyalty_card_id"]
            isOneToOne: false
            referencedRelation: "loyalty_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_cards: {
        Row: {
          background_image_url: string | null
          business_id: string
          card_color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          nfc_data: string | null
          qr_code: string | null
          reward_description: string
          settings: Json | null
          stamps_required: number
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          business_id: string
          card_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nfc_data?: string | null
          qr_code?: string | null
          reward_description: string
          settings?: Json | null
          stamps_required?: number
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          business_id?: string
          card_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nfc_data?: string | null
          qr_code?: string | null
          reward_description?: string
          settings?: Json | null
          stamps_required?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_cards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      promotion_usages: {
        Row: {
          created_at: string
          customer_card_id: string | null
          customer_id: string
          id: string
          last_used_at: string | null
          promotion_id: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          customer_card_id?: string | null
          customer_id: string
          id?: string
          last_used_at?: string | null
          promotion_id: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          customer_card_id?: string | null
          customer_id?: string
          id?: string
          last_used_at?: string | null
          promotion_id?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_usages_customer_card_id_fkey"
            columns: ["customer_card_id"]
            isOneToOne: false
            referencedRelation: "customer_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usages_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          business_id: string
          config: Json
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          loyalty_card_id: string | null
          name: string
          priority: number
          promo_type: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          business_id: string
          config?: Json
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          loyalty_card_id?: string | null
          name: string
          priority?: number
          promo_type: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          config?: Json
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          loyalty_card_id?: string | null
          name?: string
          priority?: number
          promo_type?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_loyalty_card_id_fkey"
            columns: ["loyalty_card_id"]
            isOneToOne: false
            referencedRelation: "loyalty_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          currency: string
          customer_id: string
          id: string
          items: Json
          loyalty_card_id: string | null
          metadata: Json
          stamps_awarded: number
        }
        Insert: {
          amount?: number
          business_id: string
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          items?: Json
          loyalty_card_id?: string | null
          metadata?: Json
          stamps_awarded?: number
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          items?: Json
          loyalty_card_id?: string | null
          metadata?: Json
          stamps_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_loyalty_card_id_fkey"
            columns: ["loyalty_card_id"]
            isOneToOne: false
            referencedRelation: "loyalty_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          business_id: string
          created_at: string
          customer_card_id: string
          expires_at: string | null
          id: string
          is_redeemed: boolean | null
          metadata: Json | null
          redeemed_at: string | null
          redeemed_by: string | null
          reward_description: string | null
          reward_type: string
          reward_value: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_card_id: string
          expires_at?: string | null
          id?: string
          is_redeemed?: boolean | null
          metadata?: Json | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          reward_description?: string | null
          reward_type: string
          reward_value: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_card_id?: string
          expires_at?: string | null
          id?: string
          is_redeemed?: boolean | null
          metadata?: Json | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          reward_description?: string | null
          reward_type?: string
          reward_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_customer_card_id_fkey"
            columns: ["customer_card_id"]
            isOneToOne: false
            referencedRelation: "customer_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_promotions: {
        Row: {
          applied_at: string | null
          promotion_id: string
          stamp_id: string
        }
        Insert: {
          applied_at?: string | null
          promotion_id: string
          stamp_id: string
        }
        Update: {
          applied_at?: string | null
          promotion_id?: string
          stamp_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamp_promotions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_promotions_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "stamps"
            referencedColumns: ["id"]
          },
        ]
      }
      stamps: {
        Row: {
          business_id: string
          created_at: string
          customer_card_id: string
          id: string
          location: string | null
          metadata: Json | null
          staff_id: string | null
          stamp_method: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_card_id: string
          id?: string
          location?: string | null
          metadata?: Json | null
          staff_id?: string | null
          stamp_method: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_card_id?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          staff_id?: string | null
          stamp_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamps_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamps_customer_card_id_fkey"
            columns: ["customer_card_id"]
            isOneToOne: false
            referencedRelation: "customer_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamps_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          currency: string
          customer_limit: number | null
          description: string | null
          features: Json
          id: string
          is_active: boolean
          loyalty_cards_limit: number | null
          name: string
          price_monthly_cents: number
          price_yearly_cents: number | null
          sort_order: number
          staff_accounts_limit: number | null
          stamp_events_per_month_limit: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          customer_limit?: number | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          loyalty_cards_limit?: number | null
          name: string
          price_monthly_cents?: number
          price_yearly_cents?: number | null
          sort_order?: number
          staff_accounts_limit?: number | null
          stamp_events_per_month_limit?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          customer_limit?: number | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          loyalty_cards_limit?: number | null
          name?: string
          price_monthly_cents?: number
          price_yearly_cents?: number | null
          sort_order?: number
          staff_accounts_limit?: number | null
          stamp_events_per_month_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      wallet_passes: {
        Row: {
          business_id: string
          created_at: string
          customer_card_id: string
          id: string
          is_revoked: boolean
          last_used_at: string | null
          pass_type: string
          qr_token: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_card_id: string
          id?: string
          is_revoked?: boolean
          last_used_at?: string | null
          pass_type?: string
          qr_token: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_card_id?: string
          id?: string
          is_revoked?: boolean
          last_used_at?: string | null
          pass_type?: string
          qr_token?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "wallet_passes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_passes_customer_card_id_fkey"
            columns: ["customer_card_id"]
            isOneToOne: false
            referencedRelation: "customer_cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_purchase_with_stamp: {
        Args: {
          p_amount: number
          p_base_stamps?: number
          p_business_id: string
          p_currency?: string
          p_customer_card_id: string
          p_items?: Json
          p_metadata?: Json
        }
        Returns: Json
      }
      add_stamp_and_check_reward: {
        Args: {
          p_business_id: string
          p_customer_card_id: string
          p_location?: string
          p_metadata?: Json
          p_stamp_method?: string
        }
        Returns: Json
      }
      add_stamp_with_promotions: {
        Args: {
          p_business_id: string
          p_customer_card_id: string
          p_location?: string
          p_metadata?: Json
          p_stamp_method?: string
        }
        Returns: Json
      }
      assert_business_owner: {
        Args: { p_business_id: string }
        Returns: boolean
      }
      create_customer_and_card: {
        Args: { p_business_id: string; p_customer_data: Json }
        Returns: Json
      }
      ensure_business_and_default_card: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      ensure_customer_and_card: {
        Args:
          | {
              p_business_id: string
              p_customer_email: string
              p_customer_name?: string
              p_loyalty_card_id: string
            }
          | { p_customer_id: string; p_loyalty_card_id: string }
        Returns: Json
      }
      evaluate_and_apply_promotions: {
        Args: {
          p_base_stamps?: number
          p_business_id: string
          p_customer_id: string
          p_loyalty_card_id: string
        }
        Returns: Json
      }
      generate_loyalty_card_qr: {
        Args: { p_loyalty_card_id: string }
        Returns: string
      }
      generate_wallet_pass: {
        Args: {
          p_business_id: string
          p_customer_card_id: string
          p_pass_type?: string
        }
        Returns: Json
      }
      get_business_analytics: {
        Args: { p_business_id: string; p_days?: number }
        Returns: Json
      }
      get_customer_analytics: {
        Args: { p_business_id: string; p_days?: number }
        Returns: Json
      }
      get_customer_dashboard_data: {
        Args: { p_business_id: string; p_limit?: number }
        Returns: Json
      }
      get_customer_segments: {
        Args: { p_business_id: string; p_days?: number }
        Returns: {
          customers: number
          segment: string
        }[]
      }
      get_platform_objects: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_promotion_usage: {
        Args: { p_business_id: string }
        Returns: {
          promotion_id: string
          usage_count: number
        }[]
      }
      get_redemptions_stats: {
        Args: { p_business_id: string; p_range: string }
        Returns: {
          count: number
        }[]
      }
      get_reward_conversion: {
        Args: { p_business_id: string; p_days?: number }
        Returns: Json
      }
      get_rewards_timeseries: {
        Args: { p_business_id: string; p_days?: number }
        Returns: {
          day: string
          rewards_count: number
        }[]
      }
      get_stamps_stats: {
        Args: { p_business_id: string; p_range: string }
        Returns: {
          count: number
        }[]
      }
      get_stamps_timeseries: {
        Args: { p_business_id: string; p_days?: number }
        Returns: {
          day: string
          redemptions_count: number
          stamps_count: number
        }[]
      }
      redeem_wallet_pass_token: {
        Args: { p_business_id: string; p_qr_token: string }
        Returns: Json
      }
      refresh_business_stats: {
        Args: { p_business_id: string }
        Returns: undefined
      }
      regenerate_wallet_pass: {
        Args: {
          p_business_id: string
          p_customer_card_id: string
          p_pass_type?: string
        }
        Returns: Json
      }
      revoke_wallet_pass: {
        Args: { p_business_id: string; p_wallet_pass_id: string }
        Returns: Json
      }
      seed_demo_promotion: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
