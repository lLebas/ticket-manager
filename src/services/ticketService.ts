import { ALLOWED_TRANSITIONS, CreateTicketInput, Ticket, TicketFilters, TicketStatus, UpdateTicketInput } from '../domain/ticket';
import { ConflictError, NotFoundError } from '../errors/AppError';
import { TicketRepository } from '../repository/ticketRepository';

export class TicketService {
  constructor(private readonly repository: TicketRepository) {}

  create(input: CreateTicketInput): Ticket {
    return this.repository.create(input);
  }

  getById(id: string): Ticket {
    const ticket = this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundError(`ticket ${id} nao encontrado`);
    }
    return ticket;
  }

  list(filters: TicketFilters): { items: Ticket[]; total: number; page: number; pageSize: number } {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
    const { items, total } = this.repository.list({ ...filters, page, pageSize });
    return { items, total, page, pageSize };
  }

  update(id: string, changes: UpdateTicketInput): Ticket {
    const existing = this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`ticket ${id} nao encontrado`);
    }
    const updated = this.repository.update(id, changes);
    // updated nunca sera undefined aqui pois acabamos de confirmar a existencia
    return updated as Ticket;
  }

  transitionStatus(id: string, nextStatus: TicketStatus): Ticket {
    const existing = this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`ticket ${id} nao encontrado`);
    }
    if (existing.status === nextStatus) {
      return existing;
    }
    const allowed = ALLOWED_TRANSITIONS[existing.status];
    if (!allowed.includes(nextStatus)) {
      throw new ConflictError(
        `transicao de status invalida: '${existing.status}' -> '${nextStatus}'`,
        { from: existing.status, to: nextStatus, allowed }
      );
    }
    return this.repository.updateStatus(id, nextStatus) as Ticket;
  }

  delete(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`ticket ${id} nao encontrado`);
    }
  }
}
