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
      access_keys: {
        Row: {
          created_at: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key: string
          last_used_at: string | null
          max_uses: number | null
          profile_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          last_used_at?: string | null
          max_uses?: number | null
          profile_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          last_used_at?: string | null
          max_uses?: number | null
          profile_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_keys_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      adhesions: {
        Row: {
          commentaires: string | null
          created_at: string
          date_debut: string
          date_fin: string
          id: string
          montant: number | null
          status: Database["public"]["Enums"]["adhesion_status"]
          type_adhesion: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commentaires?: string | null
          created_at?: string
          date_debut?: string
          date_fin?: string
          id?: string
          montant?: number | null
          status?: Database["public"]["Enums"]["adhesion_status"]
          type_adhesion?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commentaires?: string | null
          created_at?: string
          date_debut?: string
          date_fin?: string
          id?: string
          montant?: number | null
          status?: Database["public"]["Enums"]["adhesion_status"]
          type_adhesion?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adhesions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          category: string
          status: "non-lu" | "lu" | "repondu"
          admin_reply: string | null
          replied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          category?: string
          status?: "non-lu" | "lu" | "repondu"
          admin_reply?: string | null
          replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string
          message?: string
          category?: string
          status?: "non-lu" | "lu" | "repondu"
          admin_reply?: string | null
          replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      article_notifications: {
        Row: {
          article_id: string
          id: string
          notification_type: string
          sent_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          id?: string
          notification_type?: string
          sent_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          id?: string
          notification_type?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_notifications_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_notifications_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          auth_method: string | null
          created_at: string | null
          email: string | null
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth_method?: string | null
          created_at?: string | null
          email?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth_method?: string | null
          created_at?: string | null
          email?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      delegation_hours: {
        Row: {
          created_at: string
          date_used: string
          description: string | null
          end_time: string | null
          hours_used: number
          id: string
          mandate_type: Database["public"]["Enums"]["mandate_type"]
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_used?: string
          description?: string | null
          end_time?: string | null
          hours_used: number
          id?: string
          mandate_type: Database["public"]["Enums"]["mandate_type"]
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_used?: string
          description?: string | null
          end_time?: string | null
          hours_used?: number
          id?: string
          mandate_type?: Database["public"]["Enums"]["mandate_type"]
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dons: {
        Row: {
          anonyme: boolean | null
          created_at: string | null
          devise: string | null
          id: string
          message: string | null
          montant: number
          paypal_order_id: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          anonyme?: boolean | null
          created_at?: string | null
          devise?: string | null
          id?: string
          message?: string | null
          montant: number
          paypal_order_id?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          anonyme?: boolean | null
          created_at?: string | null
          devise?: string | null
          id?: string
          message?: string | null
          montant?: number
          paypal_order_id?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: []
      }
      election_candidates: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number | null
          full_name: string
          id: string
          list_name: string | null
          photo_url: string | null
          role_title: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          full_name: string
          id?: string
          list_name?: string | null
          photo_url?: string | null
          role_title: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          full_name?: string
          id?: string
          list_name?: string | null
          photo_url?: string | null
          role_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      election_documents: {
        Row: {
          description: string | null
          document_type: string | null
          file_url: string
          id: string
          list_name: string | null
          published_at: string | null
          title: string
        }
        Insert: {
          description?: string | null
          document_type?: string | null
          file_url: string
          id?: string
          list_name?: string | null
          published_at?: string | null
          title: string
        }
        Update: {
          description?: string | null
          document_type?: string | null
          file_url?: string
          id?: string
          list_name?: string | null
          published_at?: string | null
          title?: string
        }
        Relationships: []
      }
      election_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_public: boolean | null
          location: string | null
          organizer_id: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_public?: boolean | null
          location?: string | null
          organizer_id?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_public?: boolean | null
          location?: string | null
          organizer_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_banners: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          is_active: boolean | null
          link: string | null
          message: string
          start_date: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          link?: string | null
          message: string
          start_date?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          link?: string | null
          message?: string
          start_date?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      formation_participants: {
        Row: {
          created_at: string
          formation_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          formation_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          formation_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formation_participants_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          created_at: string
          date_formation: string
          description: string | null
          duree_heures: number | null
          formateur: string | null
          id: string
          lieu: string | null
          max_participants: number | null
          status: string | null
          titre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_formation: string
          description?: string | null
          duree_heures?: number | null
          formateur?: string | null
          id?: string
          lieu?: string | null
          max_participants?: number | null
          status?: string | null
          titre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_formation?: string
          description?: string | null
          duree_heures?: number | null
          formateur?: string | null
          id?: string
          lieu?: string | null
          max_participants?: number | null
          status?: string | null
          titre?: string
          updated_at?: string
        }
        Relationships: []
      }
      meeting_history: {
        Row: {
          created_at: string
          display_name: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          meeting_link: string | null
          notes: string | null
          participant_count: number | null
          room_name: string
          started_at: string
          user_id: string | null
          user_role: string
        }
        Insert: {
          created_at?: string
          display_name: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          participant_count?: number | null
          room_name: string
          started_at?: string
          user_id?: string | null
          user_role?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          participant_count?: number | null
          room_name?: string
          started_at?: string
          user_id?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          created_at: string
          display_order: number
          href: string
          icon: string | null
          id: string
          is_visible: boolean
          label: string
          open_in_new_tab: boolean
          parent_group: string | null
          parent_id: string | null
          profile_id: string
          requires_auth: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          href: string
          icon?: string | null
          id?: string
          is_visible?: boolean
          label: string
          open_in_new_tab?: boolean
          parent_group?: string | null
          parent_id?: string | null
          profile_id: string
          requires_auth?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          href?: string
          icon?: string | null
          id?: string
          is_visible?: boolean
          label?: string
          open_in_new_tab?: boolean
          parent_group?: string | null
          parent_id?: string | null
          profile_id?: string
          requires_auth?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "menu_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_profiles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      nao_2026_responses: {
        Row: {
          anciennete: string | null
          categorie: string | null
          created_at: string | null
          egalite_commentaire: string | null
          egalite_priorite: string | null
          id: string
          message_deleguees: string | null
          salaires_commentaire: string | null
          salaires_priorite: string | null
          salaires_type_augmentation: string | null
          satisfaction_globale: number | null
          site: string | null
          situation_personnelle: string | null
          social_commentaire: string | null
          social_priorite: string | null
          temps_commentaire: string | null
          temps_priorite: string | null
          top5: string[] | null
        }
        Insert: {
          anciennete?: string | null
          categorie?: string | null
          created_at?: string | null
          egalite_commentaire?: string | null
          egalite_priorite?: string | null
          id?: string
          message_deleguees?: string | null
          salaires_commentaire?: string | null
          salaires_priorite?: string | null
          salaires_type_augmentation?: string | null
          satisfaction_globale?: number | null
          site?: string | null
          situation_personnelle?: string | null
          social_commentaire?: string | null
          social_priorite?: string | null
          temps_commentaire?: string | null
          temps_priorite?: string | null
          top5?: string[] | null
        }
        Update: {
          anciennete?: string | null
          categorie?: string | null
          created_at?: string | null
          egalite_commentaire?: string | null
          egalite_priorite?: string | null
          id?: string
          message_deleguees?: string | null
          salaires_commentaire?: string | null
          salaires_priorite?: string | null
          salaires_type_augmentation?: string | null
          satisfaction_globale?: number | null
          site?: string | null
          situation_personnelle?: string | null
          social_commentaire?: string | null
          social_priorite?: string | null
          temps_commentaire?: string | null
          temps_priorite?: string | null
          top5?: string[] | null
        }
        Relationships: []
      }
      newsletter_sends: {
        Row: {
          error_details: string | null
          failed_sends: number | null
          id: string
          newsletter_id: string
          sent_at: string
          sent_by: string
          status: string
          successful_sends: number | null
          total_recipients: number | null
        }
        Insert: {
          error_details?: string | null
          failed_sends?: number | null
          id?: string
          newsletter_id: string
          sent_at?: string
          sent_by: string
          status?: string
          successful_sends?: number | null
          total_recipients?: number | null
        }
        Update: {
          error_details?: string | null
          failed_sends?: number | null
          id?: string
          newsletter_id?: string
          sent_at?: string
          sent_by?: string
          status?: string
          successful_sends?: number | null
          total_recipients?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_sends_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          created_by: string | null
          id: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      nextcloud_folder_permissions: {
        Row: {
          can_download: boolean | null
          can_read: boolean | null
          created_at: string | null
          folder_path: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          can_download?: boolean | null
          can_read?: boolean | null
          created_at?: string | null
          folder_path: string
          id?: string
          role: string
          updated_at?: string | null
        }
        Update: {
          can_download?: boolean | null
          can_read?: boolean | null
          created_at?: string | null
          folder_path?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          notify_actions: boolean
          notify_articles: boolean
          notify_formations: boolean
          notify_whatsapp: boolean
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notify_actions?: boolean
          notify_articles?: boolean
          notify_formations?: boolean
          notify_whatsapp?: boolean
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notify_actions?: boolean
          notify_articles?: boolean
          notify_formations?: boolean
          notify_whatsapp?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participation_colleges: {
        Row: {
          display_order: number | null
          id: string
          nom: string
          snapshot_id: string | null
          sup_inscrits: number
          sup_taux: number
          sup_votants: number
          taux_college: number
          tit_inscrits: number
          tit_taux: number
          tit_votants: number
        }
        Insert: {
          display_order?: number | null
          id?: string
          nom: string
          snapshot_id?: string | null
          sup_inscrits: number
          sup_taux: number
          sup_votants: number
          taux_college: number
          tit_inscrits: number
          tit_taux: number
          tit_votants: number
        }
        Update: {
          display_order?: number | null
          id?: string
          nom?: string
          snapshot_id?: string | null
          sup_inscrits?: number
          sup_taux?: number
          sup_votants?: number
          taux_college?: number
          tit_inscrits?: number
          tit_taux?: number
          tit_votants?: number
        }
        Relationships: [
          {
            foreignKeyName: "participation_colleges_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "participation_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      participation_snapshots: {
        Row: {
          created_at: string | null
          date: string
          heure: string
          id: string
          taux_etablissement: number
        }
        Insert: {
          created_at?: string | null
          date: string
          heure: string
          id?: string
          taux_etablissement: number
        }
        Update: {
          created_at?: string | null
          date?: string
          heure?: string
          id?: string
          taux_etablissement?: number
        }
        Relationships: []
      }
      passkey_credentials: {
        Row: {
          backed_up: boolean | null
          counter: number
          created_at: string | null
          credential_id: string
          device_type: string | null
          friendly_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string | null
          credential_id: string
          device_type?: string | null
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string | null
          credential_id?: string
          device_type?: string | null
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          name: Database["public"]["Enums"]["permission_type"]
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          name: Database["public"]["Enums"]["permission_type"]
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          name?: Database["public"]["Enums"]["permission_type"]
        }
        Relationships: []
      }
      popups: {
        Row: {
          button_text: string | null
          button_url: string | null
          content: string
          created_at: string
          created_by: string | null
          display_frequency: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          position: string | null
          show_to_anonymous: boolean
          show_to_authenticated: boolean
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          display_frequency?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: string | null
          show_to_anonymous?: boolean
          show_to_authenticated?: boolean
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          display_frequency?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: string | null
          show_to_anonymous?: boolean
          show_to_authenticated?: boolean
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_key: string | null
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          access_key?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          access_key?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      smtp_config: {
        Row: {
          created_at: string
          from_email: string
          from_name: string | null
          host: string
          id: string
          is_active: boolean
          name: string
          port: number
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name?: string | null
          host: string
          id?: string
          is_active?: boolean
          name: string
          port: number
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string | null
          host?: string
          id?: string
          is_active?: boolean
          name?: string
          port?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      survey_options: {
        Row: {
          display_order: number
          id: string
          option_text: string
          question_id: string
        }
        Insert: {
          display_order?: number
          id?: string
          option_text: string
          question_id: string
        }
        Update: {
          display_order?: number
          id?: string
          option_text?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          display_order: number
          id: string
          question_text: string
          question_type: string
          survey_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          question_text: string
          question_type?: string
          survey_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          question_text?: string
          question_type?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          option_id: string | null
          question_id: string
          survey_id: string
          text_response: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_id?: string | null
          question_id: string
          survey_id: string
          text_response?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string | null
          question_id?: string
          survey_id?: string
          text_response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "survey_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          allow_multiple_votes: boolean
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          is_anonymous: boolean
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_multiple_votes?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          is_anonymous?: boolean
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_multiple_votes?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          is_anonymous?: boolean
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracts: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          footer: string | null
          id: string
          image_url: string | null
          is_published: boolean
          layout_id: string
          subtitle: string | null
          theme_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          footer?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          layout_id?: string
          subtitle?: string | null
          theme_id?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          footer?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          layout_id?: string
          subtitle?: string | null
          theme_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mandates: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          mandate_type: Database["public"]["Enums"]["mandate_type"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          mandate_type: Database["public"]["Enums"]["mandate_type"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          mandate_type?: Database["public"]["Enums"]["mandate_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      categories: {
        Row: {
          id: string | null
          name: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string | null
          image_url: string | null
          published: boolean | null
          published_at: string | null
          slug: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string | null
          image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string | null
          image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      cleanup_expired_webauthn_challenges: { Args: never; Returns: undefined }
      cleanup_old_auth_logs: {
        Args: { days_to_keep?: number }
        Returns: undefined
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      generate_access_key: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["user_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          _permission: Database["public"]["Enums"]["permission_type"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      regenerate_unsubscribe_token: {
        Args: { subscriber_email: string }
        Returns: string
      }
      update_app_config: {
        Args: { p_key: string; p_value: string }
        Returns: undefined
      }
    }
    Enums: {
      adhesion_status: "en_attente" | "validee" | "refusee" | "expiree"
      article_status: "brouillon" | "en_revision" | "approuve" | "publie"
      mandate_type: "delegue_syndical" | "titulaire_cse" | "membre_cssct"
      member_status: "actif" | "inactif" | "suspendu"
      permission_type:
        | "manage_users"
        | "manage_roles"
        | "manage_sections"
        | "manage_pages"
        | "manage_content"
        | "manage_popups"
        | "manage_themes"
        | "manage_shop"
        | "manage_droits"
        | "view_analytics"
        | "manage_formations"
        | "manage_adhesions"
        | "manage_emails"
        | "manage_articles"
        | "create_articles"
        | "edit_own_articles"
        | "publish_articles"
        | "manage_finances"
        | "view_financial_reports"
        | "manage_recettes_depenses"
      user_role:
        | "admin"
        | "representant"
        | "adherent"
        | "public"
        | "redacteur"
        | "tresorier"
        | "secretaire"
        | "visio"
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
      adhesion_status: ["en_attente", "validee", "refusee", "expiree"],
      article_status: ["brouillon", "en_revision", "approuve", "publie"],
      mandate_type: ["delegue_syndical", "titulaire_cse", "membre_cssct"],
      member_status: ["actif", "inactif", "suspendu"],
      permission_type: [
        "manage_users",
        "manage_roles",
        "manage_sections",
        "manage_pages",
        "manage_content",
        "manage_popups",
        "manage_themes",
        "manage_shop",
        "manage_droits",
        "view_analytics",
        "manage_formations",
        "manage_adhesions",
        "manage_emails",
        "manage_articles",
        "create_articles",
        "edit_own_articles",
        "publish_articles",
        "manage_finances",
        "view_financial_reports",
        "manage_recettes_depenses",
      ],
      user_role: [
        "admin",
        "representant",
        "adherent",
        "public",
        "redacteur",
        "tresorier",
        "secretaire",
        "visio",
      ],
    },
  },
} as const

