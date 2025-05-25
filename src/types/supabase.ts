export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
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
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string
          email: string
          name: string
          super_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          name: string
          super_agent?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          name?: string
          super_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_status: string
          created_at: string | null
          created_by: string
          email: string
          id: string
          notes: string | null
          phone: string
          preferred_college: string
          preferred_course: string
          student_name: string
          subagent_id: string | null
          superagent_id: string | null
          updated_at: string | null
        }
        Insert: {
          application_status: string
          created_at?: string | null
          created_by: string
          email: string
          id: string
          notes?: string | null
          phone: string
          preferred_college: string
          preferred_course: string
          student_name: string
          subagent_id?: string | null
          superagent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          application_status?: string
          created_at?: string | null
          created_by?: string
          email?: string
          id?: string
          notes?: string | null
          phone?: string
          preferred_college?: string
          preferred_course?: string
          student_name?: string
          subagent_id?: string | null
          superagent_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      applications_registry: {
        Row: {
          created_at: string | null
          superagent_id: string
        }
        Insert: {
          created_at?: string | null
          superagent_id: string
        }
        Update: {
          created_at?: string | null
          superagent_id?: string
        }
        Relationships: []
      }
      colleges: {
        Row: {
          agent_id: string | null
          brochure_url: string | null
          contact_number: string | null
          created_at: string | null
          id: string
          location: string
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          agent_id?: string | null
          brochure_url?: string | null
          contact_number?: string | null
          created_at?: string | null
          id?: string
          location: string
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          agent_id?: string | null
          brochure_url?: string | null
          contact_number?: string | null
          created_at?: string | null
          id?: string
          location?: string
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colleges_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["user_id"]
          },
        ]
      }
      courses: {
        Row: {
          college_id: string | null
          course_name: string
          created_at: string | null
          duration_years: number
          fees: Json
          hostel_food_fee: number | null
          id: string
          slno: string
          updated_at: string | null
        }
        Insert: {
          college_id?: string | null
          course_name: string
          created_at?: string | null
          duration_years: number
          fees?: Json
          hostel_food_fee?: number | null
          id?: string
          slno: string
          updated_at?: string | null
        }
        Update: {
          college_id?: string | null
          course_name?: string
          created_at?: string | null
          duration_years?: number
          fees?: Json
          hostel_food_fee?: number | null
          id?: string
          slno?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          application_id: string
          student_name: string
          amount: number
          transaction_status: string
          subagent_id: string | null
          agent_id: string
          completed_at: string | null
          description: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id: string
          student_name: string
          amount: number
          transaction_status: string
          subagent_id?: string | null
          agent_id: string
          completed_at?: string | null
          description?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id?: string
          student_name?: string
          amount?: number
          transaction_status?: string
          subagent_id?: string | null
          agent_id?: string
          completed_at?: string | null
          description?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_subagent_id_fkey"
            columns: ["subagent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["user_id"]
          }
        ]
      }
      commissions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          application_id: string
          transaction_id: string
          amount: number
          payment_status: string
          agent_id: string
          subagent_id: string
          payment_completed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id: string
          transaction_id: string
          amount: number
          payment_status?: string
          agent_id: string
          subagent_id: string
          payment_completed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id?: string
          transaction_id?: string
          amount?: number
          payment_status?: string
          agent_id?: string
          subagent_id?: string
          payment_completed_at?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "commissions_subagent_id_fkey"
            columns: ["subagent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["user_id"]
          }
        ]
      }
      counsellors: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          parent_id: string
          agent_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone: string
          parent_id: string
          agent_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string
          parent_id?: string
          agent_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_unused_partitions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_application_partition: {
        Args: { agent_id: string }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
