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
      applications: {
        Row: {
          applied_at: string
          id: string
          job_id: string
          match_score: number | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          id?: string
          job_id: string
          match_score?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          id?: string
          job_id?: string
          match_score?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_answers: {
        Row: {
          answered_at: string
          id: string
          option_id: string
          question_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          id?: string
          option_id: string
          question_id: string
          user_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          option_id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profile_vectors: {
        Row: {
          updated_at: string
          user_id: string
          vector: Json
        }
        Insert: {
          updated_at?: string
          user_id: string
          vector?: Json
        }
        Update: {
          updated_at?: string
          user_id?: string
          vector?: Json
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          course: string | null
          created_at: string
          desired_position: string | null
          education_level: string | null
          full_name: string | null
          graduation_year: number | null
          id: string
          institution: string | null
          languages: string | null
          parsed_resume_data: Json | null
          phone: string | null
          professional_summary: string | null
          profile_completed: boolean
          resume_file_url: string | null
          salary_expectation: number | null
          skills: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          course?: string | null
          created_at?: string
          desired_position?: string | null
          education_level?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          institution?: string | null
          languages?: string | null
          parsed_resume_data?: Json | null
          phone?: string | null
          professional_summary?: string | null
          profile_completed?: boolean
          resume_file_url?: string | null
          salary_expectation?: number | null
          skills?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          course?: string | null
          created_at?: string
          desired_position?: string | null
          education_level?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          institution?: string | null
          languages?: string | null
          parsed_resume_data?: Json | null
          phone?: string | null
          professional_summary?: string | null
          profile_completed?: boolean
          resume_file_url?: string | null
          salary_expectation?: number | null
          skills?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          city: string | null
          cnpj: string | null
          company_name: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          state: string | null
          updated_at: string
          user_id: string
          verified: boolean
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      daily_applications: {
        Row: {
          application_date: string
          count: number
          id: string
          user_id: string
        }
        Insert: {
          application_date?: string
          count?: number
          id?: string
          user_id: string
        }
        Update: {
          application_date?: string
          count?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          benefits: string | null
          city: string | null
          company_id: string
          contact_email: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          latitude: number | null
          location: string | null
          longitude: number | null
          min_education: string | null
          min_experience_years: number | null
          posted_at: string
          qualifications: string | null
          requirements: string | null
          requirements_vector: Json | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          state: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          work_type: Database["public"]["Enums"]["work_type"]
        }
        Insert: {
          benefits?: string | null
          city?: string | null
          company_id: string
          contact_email?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          min_education?: string | null
          min_experience_years?: number | null
          posted_at?: string
          qualifications?: string | null
          requirements?: string | null
          requirements_vector?: Json | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          work_type?: Database["public"]["Enums"]["work_type"]
        }
        Update: {
          benefits?: string | null
          city?: string | null
          company_id?: string
          contact_email?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          min_education?: string | null
          min_experience_years?: number | null
          posted_at?: string
          qualifications?: string | null
          requirements?: string | null
          requirements_vector?: Json | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          work_type?: Database["public"]["Enums"]["work_type"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["user_plan"]
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["user_plan"]
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          question_id: string
          weight_vector: Json
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          question_id: string
          weight_vector?: Json
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          question_id?: string
          weight_vector?: Json
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["question_category"]
          created_at: string
          difficulty: number
          id: string
          question_text: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["question_category"]
          created_at?: string
          difficulty?: number
          id?: string
          question_text: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["question_category"]
          created_at?: string
          difficulty?: number
          id?: string
          question_text?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          job_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          job_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          job_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          active: boolean
          avatar_url: string | null
          company: string | null
          content: string
          created_at: string
          id: string
          name: string
          rating: number
          role: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          company?: string | null
          content: string
          created_at?: string
          id?: string
          name: string
          rating?: number
          role?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          rating?: number
          role?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      youtube_links: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
          url: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
          url: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_company_for_recruiter: {
        Args: { p_cnpj: string; p_company_name: string; p_user_id: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_data?: Json
          p_message?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_company_private: {
        Args: { p_company_id: string }
        Returns: {
          cnpj: string
          whatsapp: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "recruiter" | "candidate"
      application_status:
        | "pending"
        | "reviewed"
        | "interview"
        | "hired"
        | "rejected"
      job_status: "active" | "paused" | "closed"
      job_type: "full_time" | "part_time" | "internship" | "temporary"
      question_category:
        | "technical"
        | "behavioral"
        | "experience"
        | "education"
        | "career_goals"
      user_plan: "free" | "premium"
      user_type: "candidate" | "recruiter" | "admin"
      work_type: "remote" | "hybrid" | "onsite"
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
      app_role: ["admin", "recruiter", "candidate"],
      application_status: [
        "pending",
        "reviewed",
        "interview",
        "hired",
        "rejected",
      ],
      job_status: ["active", "paused", "closed"],
      job_type: ["full_time", "part_time", "internship", "temporary"],
      question_category: [
        "technical",
        "behavioral",
        "experience",
        "education",
        "career_goals",
      ],
      user_plan: ["free", "premium"],
      user_type: ["candidate", "recruiter", "admin"],
      work_type: ["remote", "hybrid", "onsite"],
    },
  },
} as const
