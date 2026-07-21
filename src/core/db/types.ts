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
      user_modules: {
        Row: {
          enabled: boolean
          id: string
          installed_at: string
          module_id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          installed_at?: string
          module_id: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          enabled?: boolean
          id?: string
          installed_at?: string
          module_id?: string
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
