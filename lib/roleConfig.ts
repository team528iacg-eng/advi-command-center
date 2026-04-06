export const ROLE_AVATAR: Record<string, { bg: string; color: string }> = {
  admin: { bg: '#EDE9FE', color: '#7C3AED' },
  director: { bg: '#D1FAE5', color: '#059669' },
  sound_designer: { bg: '#FEF3C7', color: '#D97706' },
  producer: { bg: '#DBEAFE', color: '#2563EB' },
  member: { bg: '#F3F4F6', color: '#6B7280' },
};

export const ROLE_LABEL = { admin: 'Admin', director: 'Director', sound_designer: 'Sound Designer', producer: 'Producer', member: 'Member' };

export function canAccess(role: string | null | undefined, permission: string): boolean {
  if (!role) return false;
  if (role === 'admin') return true;
  const map: Record<string, string[]> = {
    view_monitor: ['admin'],
    view_all_tasks: ['admin', 'director', 'producer'],
    approve_tasks: ['admin'],
    edit_any_task: ['admin', 'director'],
    edit_assigned_tasks: ['admin', 'director', 'producer', 'sound_designer', 'member'],
    manage_members: ['admin'],
    invite_members: ['admin', 'director'],
    use_inbox: ['admin', 'director', 'producer', 'sound_designer', 'member'],
    use_ai_assistant: ['admin', 'director', 'producer', 'sound_designer', 'member'],
  };
  return (map[permission] ?? []).includes(role);
}

export function isAdmin(role: string | null | undefined): boolean { return role === 'admin'; }

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
