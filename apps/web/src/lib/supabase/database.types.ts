export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          username: string | null;
          display_name: string;
          xp: number;
          level: number;
          lifetime_wpm: number;
          lifetime_accuracy: number;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          username?: string | null;
          display_name?: string;
          xp?: number;
          level?: number;
          lifetime_wpm?: number;
          lifetime_accuracy?: number;
        },
        {
          username?: string | null;
          display_name?: string;
          xp?: number;
          level?: number;
          lifetime_wpm?: number;
          lifetime_accuracy?: number;
        }
      >;
      worlds: Table<
        {
          id: string;
          title: string;
          description: string;
          sort_order: number;
          status: string;
          created_at: string;
        },
        {
          id: string;
          title: string;
          description?: string;
          sort_order: number;
          status: string;
        },
        {
          title?: string;
          description?: string;
          sort_order?: number;
          status?: string;
        }
      >;
      lessons: Table<
        {
          id: string;
          world_id: string;
          title: string;
          sort_order: number;
          is_boss: boolean;
          target_accuracy: number;
          target_wpm: number | null;
          created_at: string;
        },
        {
          id: string;
          world_id: string;
          title: string;
          sort_order: number;
          is_boss?: boolean;
          target_accuracy?: number;
          target_wpm?: number | null;
        },
        {
          world_id?: string;
          title?: string;
          sort_order?: number;
          is_boss?: boolean;
          target_accuracy?: number;
          target_wpm?: number | null;
        }
      >;
      lesson_attempts: Table<
        {
          id: string;
          user_id: string;
          lesson_id: string | null;
          source: "lesson" | "practice" | "word-rain";
          duration_ms: number;
          wpm: number;
          raw_wpm: number;
          accuracy: number;
          consistency: number | null;
          errors: number;
          corrected_errors: number;
          max_combo: number;
          xp_earned: number;
          stars: number;
          key_stats: Json;
          created_at: string;
        },
        {
          user_id: string;
          lesson_id?: string | null;
          source?: "lesson" | "practice" | "word-rain";
          duration_ms: number;
          wpm: number;
          raw_wpm: number;
          accuracy: number;
          consistency?: number | null;
          errors: number;
          corrected_errors: number;
          max_combo: number;
          xp_earned?: number;
          stars: number;
          key_stats?: Json;
        },
        {
          xp_earned?: number;
        }
      >;
      user_progress: Table<
        {
          user_id: string;
          lesson_id: string;
          stars: number;
          best_wpm: number;
          best_accuracy: number;
          attempt_count: number;
          xp_earned: number;
          first_completed_at: string | null;
          last_attempted_at: string;
        },
        {
          user_id: string;
          lesson_id: string;
          stars?: number;
          best_wpm?: number;
          best_accuracy?: number;
          attempt_count?: number;
          xp_earned?: number;
          first_completed_at?: string | null;
          last_attempted_at?: string;
        },
        {
          stars?: number;
          best_wpm?: number;
          best_accuracy?: number;
          attempt_count?: number;
          xp_earned?: number;
          first_completed_at?: string | null;
          last_attempted_at?: string;
        }
      >;
      user_key_stats: Table<
        {
          user_id: string;
          key: string;
          attempts: number;
          correct: number;
          errors: number;
          ema_latency_ms: number | null;
          mastery_score: number;
          last_practiced_at: string | null;
        },
        {
          user_id: string;
          key: string;
          attempts?: number;
          correct?: number;
          errors?: number;
          ema_latency_ms?: number | null;
          mastery_score?: number;
          last_practiced_at?: string | null;
        },
        {
          attempts?: number;
          correct?: number;
          errors?: number;
          ema_latency_ms?: number | null;
          mastery_score?: number;
          last_practiced_at?: string | null;
        }
      >;
      daily_stats: Table<
        {
          user_id: string;
          date: string;
          practice_minutes: number;
          characters: number;
          lessons_completed: number;
          xp_earned: number;
        },
        {
          user_id: string;
          date: string;
          practice_minutes?: number;
          characters?: number;
          lessons_completed?: number;
          xp_earned?: number;
        },
        {
          practice_minutes?: number;
          characters?: number;
          lessons_completed?: number;
          xp_earned?: number;
        }
      >;
      streaks: Table<
        {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_practice_date: string | null;
          practice_days_month: number;
        },
        {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string | null;
          practice_days_month?: number;
        },
        {
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string | null;
          practice_days_month?: number;
        }
      >;
      user_settings: Table<
        {
          user_id: string;
          sound: boolean;
          assistance_override: string | null;
          reduced_motion: boolean;
          keyboard_labels: boolean;
        },
        {
          user_id: string;
          sound?: boolean;
          assistance_override?: string | null;
          reduced_motion?: boolean;
          keyboard_labels?: boolean;
        },
        {
          sound?: boolean;
          assistance_override?: string | null;
          reduced_motion?: boolean;
          keyboard_labels?: boolean;
        }
      >;
      achievements: Table<
        {
          id: string;
          title: string;
          description: string;
          xp: number;
        },
        {
          id: string;
          title: string;
          description: string;
          xp?: number;
        },
        {
          title?: string;
          description?: string;
          xp?: number;
        }
      >;
      user_achievements: Table<
        {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        },
        {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        },
        {
          unlocked_at?: string;
        }
      >;
      daily_challenges: Table<
        {
          date: string;
          challenge_id: string;
          title: string;
          description: string;
        },
        {
          date: string;
          challenge_id: string;
          title: string;
          description: string;
        },
        {
          challenge_id?: string;
          title?: string;
          description?: string;
        }
      >;
      user_daily_challenges: Table<
        {
          user_id: string;
          date: string;
          challenge_id: string;
          progress: number;
          target: number;
          completed: boolean;
          xp_awarded: boolean;
        },
        {
          user_id: string;
          date: string;
          challenge_id: string;
          progress?: number;
          target: number;
          completed?: boolean;
          xp_awarded?: boolean;
        },
        {
          challenge_id?: string;
          progress?: number;
          target?: number;
          completed?: boolean;
          xp_awarded?: boolean;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
