export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      levels: {
        Row: {
          id: string;
          module_id: string | null;
          idx: number;
          title: string;
          is_demo: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          module_id?: string | null;
          idx: number;
          title: string;
          is_demo?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          module_id?: string | null;
          idx?: number;
          title?: string;
          is_demo?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "levels_module_id_fkey";
            columns: ["module_id"];
            referencedRelation: "modules";
            referencedColumns: ["id"];
          }
        ];
      };
      content_sources: {
        Row: {
          id: string;
          owner: string | null;
          kind: "url" | "pdf" | "image" | null;
          url: string | null;
          storage_path: string | null;
          title: string | null;
          notes: string | null;
          visibility: "private" | "class" | "public";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          owner?: string | null;
          kind?: "url" | "pdf" | "image" | null;
          url?: string | null;
          storage_path?: string | null;
          title?: string | null;
          notes?: string | null;
          visibility?: "private" | "class" | "public";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          owner?: string | null;
          kind?: "url" | "pdf" | "image" | null;
          url?: string | null;
          storage_path?: string | null;
          title?: string | null;
          notes?: string | null;
          visibility?: "private" | "class" | "public";
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "content_sources_owner_fkey";
            columns: ["owner"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      quiz_items: {
        Row: {
          id: string;
          level_id: string | null;
          type: "mcq" | "hotspot" | "label" | null;
          stem: string;
          options: Json | null;
          answer: Json | null;
          explanation: string | null;
          tags: string[] | null;
          difficulty: number | null;
        };
        Insert: {
          id?: string;
          level_id?: string | null;
          type?: "mcq" | "hotspot" | "label" | null;
          stem: string;
          options?: Json | null;
          answer?: Json | null;
          explanation?: string | null;
          tags?: string[] | null;
          difficulty?: number | null;
        };
        Update: {
          id?: string;
          level_id?: string | null;
          type?: "mcq" | "hotspot" | "label" | null;
          stem?: string;
          options?: Json | null;
          answer?: Json | null;
          explanation?: string | null;
          tags?: string[] | null;
          difficulty?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_items_level_id_fkey";
            columns: ["level_id"];
            referencedRelation: "levels";
            referencedColumns: ["id"];
          }
        ];
      };
      user_progress: {
        Row: {
          user_id: string;
          level_id: string;
          best_score: number | null;
          last_played: string | null;
          completed: boolean | null;
        };
        Insert: {
          user_id: string;
          level_id: string;
          best_score?: number | null;
          last_played?: string | null;
          completed?: boolean | null;
        };
        Update: {
          user_id?: string;
          level_id?: string;
          best_score?: number | null;
          last_played?: string | null;
          completed?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_level_id_fkey";
            columns: ["level_id"];
            referencedRelation: "levels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      attempts: {
        Row: {
          id: string;
          user_id: string | null;
          quiz_item_id: string | null;
          correct: boolean | null;
          time_ms: number | null;
          confidence: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          quiz_item_id?: string | null;
          correct?: boolean | null;
          time_ms?: number | null;
          confidence?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          quiz_item_id?: string | null;
          correct?: boolean | null;
          time_ms?: number | null;
          confidence?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_quiz_item_id_fkey";
            columns: ["quiz_item_id"];
            referencedRelation: "quiz_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicSchema = Database["public"];

export type Tables<TableName extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][TableName];

export type TablesInsert<TableName extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<TableName extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][TableName]["Update"];
