/**
 * Tipos do banco Supabase — gerados a partir do schema real do projeto
 * `debora-freitas-atelie` (ref mfrveapsshbbglmkknqy) após as migrations
 * 0001–0004. Para regenerar depois de uma nova migration:
 *
 *   pnpm gen:types   (usa SUPABASE_PROJECT_ID de .env.local)
 *
 * Não editar à mão — qualquer ajuste de schema entra por migration.
 */
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
      activity_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          meta: Json
          org_id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          meta?: Json
          org_id: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          meta?: Json
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          created_at: string
          decided_by_name: string
          decision: Database["public"]["Enums"]["review_decision"]
          id: string
          note: string | null
          project_id: string
          review_link_id: string | null
        }
        Insert: {
          created_at?: string
          decided_by_name: string
          decision: Database["public"]["Enums"]["review_decision"]
          id?: string
          note?: string | null
          project_id: string
          review_link_id?: string | null
        }
        Update: {
          created_at?: string
          decided_by_name?: string
          decision?: Database["public"]["Enums"]["review_decision"]
          id?: string
          note?: string | null
          project_id?: string
          review_link_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_review_link_id_fkey"
            columns: ["review_link_id"]
            isOneToOne: false
            referencedRelation: "review_links"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          created_at: string
          fonts: Json
          id: string
          intro_template: Json | null
          logo_dark_path: string | null
          logo_light_path: string | null
          org_id: string
          outro_template: Json | null
          palette: Json
        }
        Insert: {
          created_at?: string
          fonts?: Json
          id?: string
          intro_template?: Json | null
          logo_dark_path?: string | null
          logo_light_path?: string | null
          org_id: string
          outro_template?: Json | null
          palette?: Json
        }
        Update: {
          created_at?: string
          fonts?: Json
          id?: string
          intro_template?: Json | null
          logo_dark_path?: string | null
          logo_light_path?: string | null
          org_id?: string
          outro_template?: Json | null
          palette?: Json
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact: Json
          created_at: string
          id: string
          name: string
          notes: string | null
          org_id: string
        }
        Insert: {
          contact?: Json
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          org_id: string
        }
        Update: {
          contact?: Json
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_path: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          org_id: string
          season: string | null
          year: number | null
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          season?: string | null
          year?: number | null
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          season?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          project_id: string
          resolved: boolean
          review_link_id: string | null
          timecode_ms: number | null
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          project_id: string
          resolved?: boolean
          review_link_id?: string | null
          timecode_ms?: number | null
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          project_id?: string
          resolved?: boolean
          review_link_id?: string | null
          timecode_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_review_link_id_fkey"
            columns: ["review_link_id"]
            isOneToOne: false
            referencedRelation: "review_links"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          checksum: string | null
          created_at: string
          created_by: string | null
          duration_ms: number | null
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          org_id: string
          poster_path: string | null
          project_id: string | null
          scene_tag: string | null
          size_bytes: number | null
          storage_path: string
          take_number: number | null
          width: number | null
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          org_id: string
          poster_path?: string | null
          project_id?: string | null
          scene_tag?: string | null
          size_bytes?: number | null
          storage_path: string
          take_number?: number | null
          width?: number | null
        }
        Update: {
          checksum?: string | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          org_id?: string
          poster_path?: string | null
          project_id?: string | null
          scene_tag?: string | null
          size_bytes?: number | null
          storage_path?: string
          take_number?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_kit_id: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          brand_kit_id?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          brand_kit_id?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_brand_kit_fk"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          onboarding_state: Json
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          onboarding_state?: Json
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          onboarding_state?: Json
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          aspect_ratio: string
          client_id: string | null
          collection_id: string | null
          created_at: string
          created_by: string | null
          duration_ms: number
          id: string
          kind: Database["public"]["Enums"]["project_kind"]
          org_id: string
          resolution: string
          status: Database["public"]["Enums"]["project_status"]
          thumbnail_path: string | null
          timeline: Json
          timeline_version: number
          title: string
          updated_at: string
          wizard_answers: Json
        }
        Insert: {
          aspect_ratio?: string
          client_id?: string | null
          collection_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number
          id?: string
          kind: Database["public"]["Enums"]["project_kind"]
          org_id: string
          resolution?: string
          status?: Database["public"]["Enums"]["project_status"]
          thumbnail_path?: string | null
          timeline?: Json
          timeline_version?: number
          title?: string
          updated_at?: string
          wizard_answers?: Json
        }
        Update: {
          aspect_ratio?: string
          client_id?: string | null
          collection_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number
          id?: string
          kind?: Database["public"]["Enums"]["project_kind"]
          org_id?: string
          resolution?: string
          status?: Database["public"]["Enums"]["project_status"]
          thumbnail_path?: string | null
          timeline?: Json
          timeline_version?: number
          title?: string
          updated_at?: string
          wizard_answers?: Json
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      renders: {
        Row: {
          created_at: string
          engine: Database["public"]["Enums"]["render_engine"]
          error_text: string | null
          finished_at: string | null
          id: string
          output_path: string | null
          progress: number
          project_id: string
          requested_by: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["render_status"]
        }
        Insert: {
          created_at?: string
          engine?: Database["public"]["Enums"]["render_engine"]
          error_text?: string | null
          finished_at?: string | null
          id?: string
          output_path?: string | null
          progress?: number
          project_id: string
          requested_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["render_status"]
        }
        Update: {
          created_at?: string
          engine?: Database["public"]["Enums"]["render_engine"]
          error_text?: string | null
          finished_at?: string | null
          id?: string
          output_path?: string | null
          progress?: number
          project_id?: string
          requested_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["render_status"]
        }
        Relationships: [
          {
            foreignKeyName: "renders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      review_links: {
        Row: {
          allow_comments: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          project_id: string
          token: string
        }
        Insert: {
          allow_comments?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          project_id: string
          token?: string
        }
        Update: {
          allow_comments?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          project_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
          name: string
          org_id: string | null
          preview_path: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          kind: string
          name: string
          org_id?: string | null
          preview_path?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          name?: string
          org_id?: string | null
          preview_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_has_role: {
        Args: { required: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      auth_org_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      media_kind: "video" | "image" | "audio"
      project_kind: "social" | "client_presentation" | "lookbook" | "making_of"
      project_status: "draft" | "in_review" | "approved" | "exported"
      render_engine: "ffmpeg_wasm" | "webcodecs" | "server"
      render_status: "queued" | "processing" | "done" | "error"
      review_decision: "approved" | "changes_requested"
      user_role: "owner" | "editor" | "assistant" | "viewer"
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
      media_kind: ["video", "image", "audio"],
      project_kind: ["social", "client_presentation", "lookbook", "making_of"],
      project_status: ["draft", "in_review", "approved", "exported"],
      render_engine: ["ffmpeg_wasm", "webcodecs", "server"],
      render_status: ["queued", "processing", "done", "error"],
      review_decision: ["approved", "changes_requested"],
      user_role: ["owner", "editor", "assistant", "viewer"],
    },
  },
} as const
