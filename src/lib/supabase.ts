import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users_app: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          is_admin: boolean
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
      }
      surfer_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          age: number
          height: number
          weight: number
          years_surfing: number
          can_duck_dive: boolean
          comfortable_wave_size: string
          experience_types: string[]
          paddle_fitness: string
          confidence: number
          risk_tolerance: string
          home_radius: number
          favorite_spots: string[]
          goals: string[]
          injuries: string[]
          profile_json: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          age: number
          height: number
          weight: number
          years_surfing: number
          can_duck_dive: boolean
          comfortable_wave_size: string
          experience_types: string[]
          paddle_fitness: string
          confidence: number
          risk_tolerance: string
          home_radius: number
          favorite_spots: string[]
          goals: string[]
          injuries: string[]
          profile_json?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          age?: number
          height?: number
          weight?: number
          years_surfing?: number
          can_duck_dive?: boolean
          comfortable_wave_size?: string
          experience_types?: string[]
          paddle_fitness?: string
          confidence?: number
          risk_tolerance?: string
          home_radius?: number
          favorite_spots?: string[]
          goals?: string[]
          injuries?: string[]
          profile_json?: any
          created_at?: string
          updated_at?: string
        }
      }
      spots: {
        Row: {
          id: string
          name: string
          region: string
          coordinates: number[]
          orientation: number
          break_type: string
          bottom: string
          hazards: string[]
          ideal_swell_dirs: number[]
          ideal_wind_dirs: number[]
          ideal_tide: string
          paddle_distance: number
          entry_exit_notes: string
          seasonality: string
          lifeguarded: boolean
          easy_entry: boolean
          short_paddle: boolean
          crowd_factor: number
          skill_level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          region: string
          coordinates: number[]
          orientation: number
          break_type: string
          bottom: string
          hazards: string[]
          ideal_swell_dirs: number[]
          ideal_wind_dirs: number[]
          ideal_tide: string
          paddle_distance: number
          entry_exit_notes: string
          seasonality: string
          lifeguarded: boolean
          easy_entry: boolean
          short_paddle: boolean
          crowd_factor: number
          skill_level: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          region?: string
          coordinates?: number[]
          orientation?: number
          break_type?: string
          bottom?: string
          hazards?: string[]
          ideal_swell_dirs?: number[]
          ideal_wind_dirs?: number[]
          ideal_tide?: string
          paddle_distance?: number
          entry_exit_notes?: string
          seasonality?: string
          lifeguarded?: boolean
          easy_entry?: boolean
          short_paddle?: boolean
          crowd_factor?: number
          skill_level?: string
          created_at?: string
          updated_at?: string
        }
      }
      forecast_snapshots: {
        Row: {
          id: string
          spot_id: string
          provider: string
          timestamp: string
          swell_height: number
          swell_period: number
          swell_direction: number
          wind_speed: number
          wind_direction: number
          tide_level: number
          provider_confidence: number
          raw_json: any
          created_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          provider: string
          timestamp: string
          swell_height: number
          swell_period: number
          swell_direction: number
          wind_speed: number
          wind_direction: number
          tide_level: number
          provider_confidence: number
          raw_json?: any
          created_at?: string
        }
        Update: {
          id?: string
          spot_id?: string
          provider?: string
          timestamp?: string
          swell_height?: number
          swell_period?: number
          swell_direction?: number
          wind_speed?: number
          wind_direction?: number
          tide_level?: number
          provider_confidence?: number
          raw_json?: any
          created_at?: string
        }
      }
      scoring_weights: {
        Row: {
          id: string
          name: string
          wave_size: number
          wind: number
          tide: number
          hazards: number
          experience: number
          confidence: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          wave_size: number
          wind: number
          tide: number
          hazards: number
          experience: number
          confidence: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          wave_size?: number
          wind?: number
          tide?: number
          hazards?: number
          experience?: number
          confidence?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      session_logs: {
        Row: {
          id: string
          user_id: string
          spot_id: string
          date: string
          rating: number
          notes: string
          conditions_json: any
          photo_urls: string[]
          gps_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spot_id: string
          date: string
          rating: number
          notes?: string
          conditions_json?: any
          photo_urls?: string[]
          gps_data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spot_id?: string
          date?: string
          rating?: number
          notes?: string
          conditions_json?: any
          photo_urls?: string[]
          gps_data?: any
          created_at?: string
        }
      }
      wavepools: {
        Row: {
          id: string
          name: string
          location: string
          coordinates: number[]
          schedule_json: any
          session_types: string[]
          skill_levels: string[]
          pricing_json: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          coordinates: number[]
          schedule_json: any
          session_types: string[]
          skill_levels: string[]
          pricing_json?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          coordinates?: number[]
          schedule_json?: any
          session_types?: string[]
          skill_levels?: string[]
          pricing_json?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}