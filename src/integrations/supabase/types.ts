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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      babies: {
        Row: {
          birth_date: string | null
          created_at: string
          gender: string | null
          id: string
          name: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      baby_content: {
        Row: {
          ai_tags: Json | null
          baby_id: string
          content_type: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_url: string | null
          id: string
          metadata: Json | null
          parent_id: string
          privacy_level: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_tags?: Json | null
          baby_id: string
          content_type: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          parent_id: string
          privacy_level?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_tags?: Json | null
          baby_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          parent_id?: string
          privacy_level?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "baby_content_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address_revealed: boolean
          caregiver_id: string
          created_at: string
          end_time: string
          hourly_rate: number
          id: string
          notes: string | null
          parent_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          address_revealed?: boolean
          caregiver_id: string
          created_at?: string
          end_time: string
          hourly_rate: number
          id?: string
          notes?: string | null
          parent_id: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          address_revealed?: boolean
          caregiver_id?: string
          created_at?: string
          end_time?: string
          hourly_rate?: number
          id?: string
          notes?: string | null
          parent_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      caregiver_profiles: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          bio: string | null
          certifications: Json | null
          created_at: string
          education: string | null
          full_name: string
          hourly_rate: number
          id: string
          languages: Json | null
          location_radius: number | null
          profile_completeness: number
          specialties: Json | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number | null
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string
          education?: string | null
          full_name: string
          hourly_rate?: number
          id?: string
          languages?: Json | null
          location_radius?: number | null
          profile_completeness?: number
          specialties?: Json | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string
          education?: string | null
          full_name?: string
          hourly_rate?: number
          id?: string
          languages?: Json | null
          location_radius?: number | null
          profile_completeness?: number
          specialties?: Json | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Relationships: []
      }
      caregiver_verifications: {
        Row: {
          caregiver_id: string
          created_at: string
          document_url: string | null
          expires_at: string | null
          fraud_flags: Json | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          document_url?: string | null
          expires_at?: string | null
          fraud_flags?: Json | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          document_url?: string | null
          expires_at?: string | null
          fraud_flags?: Json | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          name: string
          notify_on_incidents: boolean | null
          parent_id: string
          phone: string
          relationship: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name: string
          notify_on_incidents?: boolean | null
          parent_id: string
          phone: string
          relationship: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          notify_on_incidents?: boolean | null
          parent_id?: string
          phone?: string
          relationship?: string
        }
        Relationships: []
      }
      engagement_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      geofence_zones: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          parent_id: string
          radius_meters: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name?: string
          parent_id: string
          radius_meters?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          parent_id?: string
          radius_meters?: number
          updated_at?: string
        }
        Relationships: []
      }
      investor_inquiries: {
        Row: {
          created_at: string
          email: string
          firm: string | null
          id: string
          investment_range: string | null
          investor_name: string
          message: string | null
          nda_requested: boolean
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          firm?: string | null
          id?: string
          investment_range?: string | null
          investor_name: string
          message?: string | null
          nda_requested?: boolean
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          firm?: string | null
          id?: string
          investment_range?: string | null
          investor_name?: string
          message?: string | null
          nda_requested?: boolean
          phone?: string | null
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          baby_id: string
          created_at: string
          id: string
          score: number | null
          topic: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          id?: string
          score?: number | null
          topic: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          id?: string
          score?: number | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      liveops_campaigns: {
        Row: {
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_percent: number | null
          ends_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          starts_at: string
          target_audience: string | null
          title: string
        }
        Insert: {
          campaign_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_percent?: number | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          starts_at: string
          target_audience?: string | null
          title: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_percent?: number | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          starts_at?: string
          target_audience?: string | null
          title?: string
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          badges: Json | null
          booking_streak: number | null
          created_at: string
          credits_balance: number | null
          id: string
          points: number
          tier: string
          total_bookings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: Json | null
          booking_streak?: number | null
          created_at?: string
          credits_balance?: number | null
          id?: string
          points?: number
          tier?: string
          total_bookings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: Json | null
          booking_streak?: number | null
          created_at?: string
          credits_balance?: number | null
          id?: string
          points?: number
          tier?: string
          total_bookings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          read_at: string | null
          sender_id: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_id: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_preferences: {
        Row: {
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          location_radius_km: number | null
          max_hourly_rate: number | null
          min_experience_years: number | null
          preferred_languages: Json | null
          preferred_specialties: Json | null
          schedule_preferences: Json | null
          special_requirements: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          max_hourly_rate?: number | null
          min_experience_years?: number | null
          preferred_languages?: Json | null
          preferred_specialties?: Json | null
          schedule_preferences?: Json | null
          special_requirements?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          max_hourly_rate?: number | null
          min_experience_years?: number | null
          preferred_languages?: Json | null
          preferred_specialties?: Json | null
          schedule_preferences?: Json | null
          special_requirements?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parenting_guides: {
        Row: {
          baby_id: string
          created_at: string
          guide_text: string
          id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          guide_text: string
          id?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          guide_text?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parenting_guides_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendation_logs: {
        Row: {
          caregiver_id: string
          compatibility_score: number
          created_at: string
          id: string
          match_reasons: Json | null
          parent_id: string
          was_booked: boolean | null
          was_clicked: boolean | null
          was_successful: boolean | null
        }
        Insert: {
          caregiver_id: string
          compatibility_score?: number
          created_at?: string
          id?: string
          match_reasons?: Json | null
          parent_id: string
          was_booked?: boolean | null
          was_clicked?: boolean | null
          was_successful?: boolean | null
        }
        Update: {
          caregiver_id?: string
          compatibility_score?: number
          created_at?: string
          id?: string
          match_reasons?: Json | null
          parent_id?: string
          was_booked?: boolean | null
          was_clicked?: boolean | null
          was_successful?: boolean | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          reward_amount: number | null
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          reward_amount?: number | null
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_amount?: number | null
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          is_verified_hire: boolean
          kindness_rating: number | null
          overall_rating: number
          punctuality_rating: number | null
          reviewee_id: string
          reviewer_id: string
          safety_rating: number | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_hire?: boolean
          kindness_rating?: number | null
          overall_rating: number
          punctuality_rating?: number | null
          reviewee_id: string
          reviewer_id: string
          safety_rating?: number | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_hire?: boolean
          kindness_rating?: number | null
          overall_rating?: number
          punctuality_rating?: number | null
          reviewee_id?: string
          reviewer_id?: string
          safety_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          admin_escalated_at: string | null
          booking_id: string | null
          created_at: string
          description: string | null
          emergency_contact_notified_at: string | null
          id: string
          incident_type: string
          location_lat: number | null
          location_lng: number | null
          metadata: Json | null
          parent_notified_at: string | null
          reported_by: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_escalated_at?: string | null
          booking_id?: string | null
          created_at?: string
          description?: string | null
          emergency_contact_notified_at?: string | null
          id?: string
          incident_type: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          parent_notified_at?: string | null
          reported_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_escalated_at?: string | null
          booking_id?: string | null
          created_at?: string
          description?: string | null
          emergency_contact_notified_at?: string | null
          id?: string
          incident_type?: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          parent_notified_at?: string | null
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      session_checkins: {
        Row: {
          address: string | null
          booking_id: string
          caregiver_id: string
          check_type: string
          created_at: string
          id: string
          is_within_geofence: boolean | null
          latitude: number | null
          longitude: number | null
          notes: string | null
        }
        Insert: {
          address?: string | null
          booking_id: string
          caregiver_id: string
          check_type: string
          created_at?: string
          id?: string
          is_within_geofence?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
        }
        Update: {
          address?: string | null
          booking_id?: string
          caregiver_id?: string
          check_type?: string
          created_at?: string
          id?: string
          is_within_geofence?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_checkins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          audio_url: string | null
          baby_id: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          audio_url?: string | null
          baby_id: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          audio_url?: string | null
          baby_id?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          baby_id: string
          cover_image: string | null
          created_at: string
          id: string
          pdf_url: string | null
          title: string
        }
        Insert: {
          baby_id: string
          cover_image?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          title: string
        }
        Update: {
          baby_id?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      tos_acceptances: {
        Row: {
          accepted_at: string
          id: string
          ip_address: string | null
          tos_version_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          tos_version_id: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          tos_version_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tos_acceptances_tos_version_id_fkey"
            columns: ["tos_version_id"]
            isOneToOne: false
            referencedRelation: "tos_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      tos_versions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          published_at: string | null
          title: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          published_at?: string | null
          title?: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          published_at?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_interactions: {
        Row: {
          comment_text: string | null
          content_id: string
          created_at: string
          id: string
          interaction_type: string
          user_id: string
          watch_duration_seconds: number | null
          watch_percentage: number | null
        }
        Insert: {
          comment_text?: string | null
          content_id: string
          created_at?: string
          id?: string
          interaction_type: string
          user_id: string
          watch_duration_seconds?: number | null
          watch_percentage?: number | null
        }
        Update: {
          comment_text?: string | null
          content_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          user_id?: string
          watch_duration_seconds?: number | null
          watch_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_interactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "baby_content"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          event_type: string
          failed_at: string | null
          id: string
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          event_type: string
          failed_at?: string | null
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          failed_at?: string | null
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: Json
          id: string
          is_active: boolean
          secret: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean
          secret: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean
          secret?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      wellbeing_reports: {
        Row: {
          activities: Json | null
          ai_generated_summary: string | null
          booking_id: string
          care_notes: string | null
          caregiver_id: string
          child_id: string | null
          created_at: string
          id: string
          incidents: string | null
          meals_log: Json | null
          mood_rating: number | null
          overall_summary: string | null
          sleep_log: Json | null
        }
        Insert: {
          activities?: Json | null
          ai_generated_summary?: string | null
          booking_id: string
          care_notes?: string | null
          caregiver_id: string
          child_id?: string | null
          created_at?: string
          id?: string
          incidents?: string | null
          meals_log?: Json | null
          mood_rating?: number | null
          overall_summary?: string | null
          sleep_log?: Json | null
        }
        Update: {
          activities?: Json | null
          ai_generated_summary?: string | null
          booking_id?: string
          care_notes?: string | null
          caregiver_id?: string
          child_id?: string | null
          created_at?: string
          id?: string
          incidents?: string | null
          meals_log?: Json | null
          mood_rating?: number | null
          overall_summary?: string | null
          sleep_log?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "wellbeing_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellbeing_reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role:
        | {
            Args: { _role: Database["public"]["Enums"]["app_role"] }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status:
        | "requested"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      message_type: "text" | "image" | "system"
      verification_status: "pending" | "verified" | "rejected"
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
    Enums: {
      app_role: ["admin", "user"],
      booking_status: [
        "requested",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      message_type: ["text", "image", "system"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
