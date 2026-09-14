export const TICKET_STATUSES = ['todo', 'in_progress', 'in_review', 'done'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

// Allowed status transitions (regra de negocio).
// 'done' so permite reabrir para 'todo'; nao ha "pulos" diretos de 'todo' para 'done'.
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['in_review', 'todo'],
  in_review: ['done', 'in_progress'],
  done: ['todo']
};

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  title: string;
  description?: string | null;
  priority?: TicketPriority;
  assignee?: string | null;
  tags?: string[];
}

export interface UpdateTicketInput {
  title?: string;
  description?: string | null;
  priority?: TicketPriority;
  assignee?: string | null;
  tags?: string[];
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
  page?: number;
  pageSize?: number;
}
