// Generated from the live Supabase schema. Do not hand-edit — regenerate via:
//   npm run db:types
// (wraps `supabase gen types typescript --project-id <ref>`), after every migration.
//
// Security note: `connected_accounts` (raw table) still types its *_enc columns
// because type generation reflects the declared schema, not column grants —
// but anon/authenticated have no SELECT grant on them (see migration 0002).
// Client code must always query the `connected_accounts_safe` view, never the
// raw table, for exactly this reason.

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          account_id: string | null
          all_day: boolean
          color: string
          created_at: string
          description: string | null
          ends_at: string
          external_etag: string | null
          external_id: string | null
          id: string
          location: string | null
          rrule: string | null
          source: string
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          all_day?: boolean
          color?: string
          created_at?: string
          description?: string | null
          ends_at: string
          external_etag?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          rrule?: string | null
          source?: string
          starts_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          all_day?: boolean
          color?: string
          created_at?: string
          description?: string | null
          ends_at?: string
          external_etag?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          rrule?: string | null
          source?: string
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_accounts: {
        Row: {
          access_token_enc: string | null
          created_at: string
          email: string | null
          id: string
          last_synced_at: string | null
          metadata: Json
          provider: string
          provider_account_id: string
          refresh_token_enc: string | null
          scopes: string[]
          status: string
          sync_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_enc?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json
          provider: string
          provider_account_id: string
          refresh_token_enc?: string | null
          scopes?: string[]
          status?: string
          sync_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_enc?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json
          provider?: string
          provider_account_id?: string
          refresh_token_enc?: string | null
          scopes?: string[]
          status?: string
          sync_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          count: number
          created_at: string
          date: string
          habit_id: string
          id: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          habit_id: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived_at: string | null
          cadence: string
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          schedule: Json
          target_per_period: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          cadence?: string
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          schedule?: Json
          target_per_period?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          cadence?: string
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          schedule?: Json
          target_per_period?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          created_at: string
          data: Json
          from_id: string
          from_type: string
          id: string
          rel_type: string
          to_id: string
          to_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          from_id: string
          from_type: string
          id?: string
          rel_type: string
          to_id: string
          to_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          from_id?: string
          from_type?: string
          id?: string
          rel_type?: string
          to_id?: string
          to_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tier: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tier: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tier?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      notifications_outbox: {
        Row: {
          body: string
          created_at: string
          data: Json
          deliver_at: string
          id: string
          sent_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          deliver_at: string
          id?: string
          sent_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          deliver_at?: string
          id?: string
          sent_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          account_id: string | null
          avatar_url: string | null
          birthday: string | null
          created_at: string
          display_name: string
          emails: string[]
          external_etag: string | null
          external_id: string | null
          id: string
          nickname: string | null
          notes: string | null
          phones: string[]
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          display_name: string
          emails?: string[]
          external_etag?: string | null
          external_id?: string | null
          id?: string
          nickname?: string | null
          notes?: string | null
          phones?: string[]
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          display_name?: string
          emails?: string[]
          external_etag?: string | null
          external_id?: string | null
          id?: string
          nickname?: string | null
          notes?: string | null
          phones?: string[]
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          expo_push_token: string
          id: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expo_push_token: string
          id?: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expo_push_token?: string
          id?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          category: string | null
          checked: boolean
          created_at: string
          id: string
          list_id: string
          name: string
          notes: string | null
          position: number
          quantity: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          checked?: boolean
          created_at?: string
          id?: string
          list_id: string
          name: string
          notes?: string | null
          position?: number
          quantity?: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          checked?: boolean
          created_at?: string
          id?: string
          list_id?: string
          name?: string
          notes?: string | null
          position?: number
          quantity?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active_entitlements: string[]
          created_at: string
          current_period_end: string | null
          id: string
          is_pro: boolean
          rc_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_entitlements?: string[]
          created_at?: string
          current_period_end?: string | null
          id?: string
          is_pro?: boolean
          rc_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_entitlements?: string[]
          created_at?: string
          current_period_end?: string | null
          id?: string
          is_pro?: boolean
          rc_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_lists: {
        Row: {
          color: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          account_id: string | null
          completed_at: string | null
          created_at: string
          due_at: string | null
          external_etag: string | null
          external_id: string | null
          id: string
          list_id: string | null
          notes: string | null
          priority: number
          source: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          external_etag?: string | null
          external_id?: string | null
          id?: string
          list_id?: string | null
          notes?: string | null
          priority?: number
          source?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          external_etag?: string | null
          external_id?: string | null
          id?: string
          list_id?: string | null
          notes?: string | null
          priority?: number
          source?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      user_modules: {
        Row: {
          enabled: boolean
          id: string
          installed_at: string
          module_id: string
          position: number
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          installed_at?: string
          module_id: string
          position?: number
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          enabled?: boolean
          id?: string
          installed_at?: string
          module_id?: string
          position?: number
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      connected_accounts_safe: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          last_synced_at: string | null
          metadata: Json | null
          provider: string | null
          provider_account_id: string | null
          scopes: string[] | null
          status: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_synced_at?: string | null
          metadata?: Json | null
          provider?: string | null
          provider_account_id?: string | null
          scopes?: string[] | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_synced_at?: string | null
          metadata?: Json | null
          provider?: string | null
          provider_account_id?: string | null
          scopes?: string[] | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
