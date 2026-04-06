/**
 * types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface UserRow {
  id: string; name: string; email: string;
  role: 'admin' | 'director' | 'producer' | 'sound_designer' | 'member';
  created_at: string;
}

export interface ProfileRow {
  id: string; user_id: string; display_name: string | null;
  avatar_url: string | null; banner_url: string | null;
  bio: string | null; links: Record<string, string> | null;
  preferences: { theme?: string; notifications?: boolean; emailUpdates?: boolean; } | null;
  created_at: string; updated_at: string;
}

export interface FullProfile { user: UserRow; profile: ProfileRow | null; }

export interface ProjectRow { id: string; name: string; color: string; emoji: string | null; created_by: string; created_at: string; }

export interface TaskRow {
  id: string; title: string; description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'pending_approval' | 'done';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  due_date: string | null; time_estimate: number; time_logged: number;
  project_id: string | null; list_id: string | null;
  assigned_to: string[]; created_by: string; completion_approved: boolean;
  tags: string[];
  subtasks: Array<{ id: string; title: string; done: boolean }>;
  comments: Array<{ id: string; author_id: string; text: string; created_at: string }>;
  created_at: string; updated_at: string;
}

export interface MessageRow { id: string; conversation_id: string; sender_id: string; content: string; type: 'text' | 'system' | 'task_ref'; task_ref_id: string | null; created_at: string; }

export interface ConversationRow { id: string; type: 'direct' | 'group'; name: string | null; participants: string[]; created_at: string; }

export type TaskInsert = Omit<TaskRow, 'id' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<Omit<TaskRow, 'id' | 'created_at' | 'created_by'>>;
export type MessageInsert = Omit<MessageRow, 'id' | 'created_at'>;
export type UserInsert = Omit<UserRow, 'id' | 'created_at'>;
export type ProfileInsert = Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>;

export interface Database {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: UserInsert; Update: Partial<UserInsert>; };
      profiles: { Row: ProfileRow; Insert: ProfileInsert; Update: Partial<ProfileInsert>; };
      projects: { Row: ProjectRow; Insert: Omit<ProjectRow, 'id' | 'created_at'>; Update: Partial<Omit<ProjectRow, 'id' | 'created_at' | 'created_by'>>; };
      tasks: { Row: TaskRow; Insert: TaskInsert; Update: TaskUpdate; };
      messages: { Row: MessageRow; Insert: MessageInsert; Update: Partial<MessageInsert>; };
      conversations: { Row: ConversationRow; Insert: Omit<ConversationRow, 'id' | 'created_at'>; Update: Partial<Omit<ConversationRow, 'id' | 'created_at'>>; };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { task_status: 'todo' | 'in_progress' | 'review' | 'pending_approval' | 'done'; task_priority: 'urgent' | 'high' | 'normal' | 'low'; user_role: 'admin' | 'director' | 'producer' | 'sound_designer' | 'member'; message_type: 'text' | 'system' | 'task_ref'; conversation_type: 'direct' | 'group'; };
  };
}
