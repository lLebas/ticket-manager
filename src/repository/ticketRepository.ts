import { v4 as uuidv4 } from 'uuid';
import { CreateTicketInput, Ticket, TicketFilters, UpdateTicketInput, TicketStatus } from '../domain/ticket';

/**
 * Repositorio em memoria. Escopo desta entrega (Entrega 1) e o harness de
 * testes e a especificacao; persistencia real (ex: Postgres) fica registrada
 * como trabalho futuro no ADR-0002.
 */
export class TicketRepository {
  private tickets: Map<string, Ticket> = new Map();

  clear(): void {
    this.tickets.clear();
  }

  create(input: CreateTicketInput): Ticket {
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: uuidv4(),
      title: input.title,
      description: input.description ?? null,
      status: 'todo',
      priority: input.priority ?? 'medium',
      assignee: input.assignee ?? null,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  findById(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  list(filters: TicketFilters): { items: Ticket[]; total: number } {
    let items = Array.from(this.tickets.values());

    if (filters.status) items = items.filter((t) => t.status === filters.status);
    if (filters.priority) items = items.filter((t) => t.priority === filters.priority);
    if (filters.assignee) items = items.filter((t) => t.assignee === filters.assignee);

    items = items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const total = items.length;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return { items: paginated, total };
  }

  update(id: string, changes: UpdateTicketInput): Ticket | undefined {
    const existing = this.tickets.get(id);
    if (!existing) return undefined;
    const updated: Ticket = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString()
    };
    this.tickets.set(id, updated);
    return updated;
  }

  updateStatus(id: string, status: TicketStatus): Ticket | undefined {
    const existing = this.tickets.get(id);
    if (!existing) return undefined;
    const updated: Ticket = { ...existing, status, updatedAt: new Date().toISOString() };
    this.tickets.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.tickets.delete(id);
  }
}

// Instancia singleton usada pela aplicacao (estado em memoria por processo).
export const ticketRepository = new TicketRepository();
