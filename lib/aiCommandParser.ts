import { Task, User } from './data';

export type ParsedCommand = {
  action: 'create_task' | 'update_task' | 'assign_task' | 'none';
  title?: string;
  assignees?: string[];
  priority?: string;
  dueDate?: string;
  status?: string;
  taskId?: string;
  spaceId?: string;
};

function matchUsers(text: string, users: User[]): string[] {
  const lower = text.toLowerCase();
  return users
    .filter(u => lower.includes(u.name.toLowerCase().split(' ')[0]))
    .map(u => u.id);
}

function matchPriority(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('urgent')) return 'urgent';
  if (lower.includes('high')) return 'high';
  if (lower.includes('low')) return 'low';
  return 'normal';
}

function matchStatus(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('done') || lower.includes('complet') || lower.includes('finish')) return 'done';
  if (lower.includes('in progress') || lower.includes('inprogress') || lower.includes('wip') || lower.includes('working')) return 'in_progress';
  if (lower.includes('review')) return 'review';
  if (lower.includes('pending') || lower.includes('approval')) return 'pending_approval';
  if (lower.includes('todo') || lower.includes('to do') || lower.includes('to-do') || lower.includes('start')) return 'todo';
  return undefined;
}

function matchDate(text: string): string | undefined {
  const lower = text.toLowerCase();
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  if (lower.includes('today')) return fmt(today);
  if (lower.includes('tomorrow')) { const d = new Date(today); d.setDate(d.getDate()+1); return fmt(d); }
  if (lower.includes('next week')) { const d = new Date(today); d.setDate(d.getDate()+7); return fmt(d); }
  if (lower.includes('end of week') || lower.includes('friday')) { const d = new Date(today); d.setDate(d.getDate()+(5-d.getDay())); return fmt(d); }

  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (slashMatch) return `${today.getFullYear()}-${pad(parseInt(slashMatch[1]))}-${pad(parseInt(slashMatch[2]))}`;

  return undefined;
}

export function parseCommand(text: string, tasks: Task[], users: User[]): ParsedCommand {
  const lower = text.toLowerCase().trim();

  // ── CREATE TASK ───────────────────────────────────────────────────────────
  const createRe = /^(?:create|add|make|new)\s+(?:a\s+)?task\s+(?:called\s+|titled\s+|named\s+|for\s+|:\s*)?[""']?([^""']+?)[""']?(?:\s+(?:for|assign|due|by|priority|urgent|high|low|normal|todo)|$)/i;
  const createMatch = text.match(createRe);
  if (createMatch) {
    const title = createMatch[1].trim();
    return {
      action: 'create_task',
      title,
      assignees: matchUsers(text, users),
      priority: matchPriority(text),
      dueDate: matchDate(text),
      spaceId: '528',
    };
  }

  const markRe = /(?:mark|set|update|change|complete|finish|move)\s+(.+?)\s+(?:as|to|status\s+to)\s+(.+)/i;
  const markMatch = text.match(markRe);
  if (markMatch) {
    const hint = markMatch[1].toLowerCase().trim();
    const statusText = markMatch[2].trim();
    const status = matchStatus(statusText);
    const matchedTask = tasks.find(t =>
      t.title.toLowerCase().includes(hint) ||
      hint.split(' ').filter(w => w.length > 3).every(w => t.title.toLowerCase().includes(w))
    );
    if (matchedTask && status) {
      return { action: 'update_task', taskId: matchedTask.id, title: matchedTask.title, status };
    }
  }

  const doneRe = /^(?:complete|finish|done with)\s+(.+)/i
  const doneMatch = text.match(doneRe);
  if (doneMatch) {
    const hint = doneMatch[1].toLowerCase().trim();
    const matchedTask = tasks.find(t => t.title.toLowerCase().includes(hint));
    if (matchedTask) {
      return { action: 'update_task', taskId: matchedTask.id, title: matchedTask.title, status: 'done' };
    }
  }

  const assignRe = /assign\s+(.+?)\s+to\s+(.+)/i;
  const assignMatch = text.match(assignRe);
  if (assignMatch) {
    const taskHint = assignMatch[1].toLowerCase().trim();
    const userText = assignMatch[2];
    const ids = matchUsers(userText, users);
    const matchedTask = tasks.find(t => t.title.toLowerCase().includes(taskHint) || t.id === taskHint);
    if (matchedTask && ids.length > 0) {
      return { action: 'assign_task', taskId: matchedTask.id, title: matchedTask.title, assignees: ids };
    }
  }

  return { action: 'none' };
}
