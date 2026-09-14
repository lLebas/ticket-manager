import { ConflictError, NotFoundError } from '../../src/errors/AppError';
import { TicketRepository } from '../../src/repository/ticketRepository';
import { TicketService } from '../../src/services/ticketService';

describe('TicketService', () => {
  let repository: TicketRepository;
  let service: TicketService;

  beforeEach(() => {
    repository = new TicketRepository();
    service = new TicketService(repository);
  });

  describe('create', () => {
    it('cria um ticket com status inicial "todo" e prioridade padrao "medium"', () => {
      const ticket = service.create({ title: 'Corrigir bug de login' });
      expect(ticket.status).toBe('todo');
      expect(ticket.priority).toBe('medium');
      expect(ticket.id).toEqual(expect.any(String));
      expect(ticket.createdAt).toEqual(ticket.updatedAt);
    });

    it('respeita a prioridade informada', () => {
      const ticket = service.create({ title: 'Investigar incidente', priority: 'critical' });
      expect(ticket.priority).toBe('critical');
    });
  });

  describe('getById', () => {
    it('retorna o ticket quando existe', () => {
      const created = service.create({ title: 'Ticket existente' });
      const found = service.getById(created.id);
      expect(found).toEqual(created);
    });

    it('lanca NotFoundError quando o ticket nao existe (edge case)', () => {
      expect(() => service.getById('id-inexistente')).toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      service.create({ title: 'Ticket A', priority: 'low' });
      service.create({ title: 'Ticket B', priority: 'high' });
      service.create({ title: 'Ticket C', priority: 'high', assignee: 'lebas' });
    });

    it('lista todos os tickets com paginacao padrao', () => {
      const result = service.list({});
      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('filtra por prioridade', () => {
      const result = service.list({ priority: 'high' });
      expect(result.total).toBe(2);
      expect(result.items.every((t) => t.priority === 'high')).toBe(true);
    });

    it('filtra por assignee', () => {
      const result = service.list({ assignee: 'lebas' });
      expect(result.total).toBe(1);
      expect(result.items[0].assignee).toBe('lebas');
    });

    it('retorna lista vazia quando nenhum ticket casa com o filtro (edge case)', () => {
      const result = service.list({ assignee: 'ninguem' });
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('pagina corretamente com pageSize customizado', () => {
      const page1 = service.list({ page: 1, pageSize: 2 });
      const page2 = service.list({ page: 2, pageSize: 2 });
      expect(page1.items).toHaveLength(2);
      expect(page2.items).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('atualiza campos parciais preservando o restante', () => {
      const created = service.create({ title: 'Original', priority: 'low' });
      const updated = service.update(created.id, { priority: 'high' });
      expect(updated.priority).toBe('high');
      expect(updated.title).toBe('Original');
    });

    it('lanca NotFoundError ao atualizar ticket inexistente (edge case)', () => {
      expect(() => service.update('nao-existe', { title: 'X' })).toThrow(NotFoundError);
    });
  });

  describe('transitionStatus', () => {
    it('permite a transicao todo -> in_progress', () => {
      const created = service.create({ title: 'Fluxo' });
      const updated = service.transitionStatus(created.id, 'in_progress');
      expect(updated.status).toBe('in_progress');
    });

    it('permite o fluxo completo todo -> in_progress -> in_review -> done', () => {
      const created = service.create({ title: 'Fluxo completo' });
      service.transitionStatus(created.id, 'in_progress');
      service.transitionStatus(created.id, 'in_review');
      const done = service.transitionStatus(created.id, 'done');
      expect(done.status).toBe('done');
    });

    it('permite reabrir um ticket "done" para "todo"', () => {
      const created = service.create({ title: 'Reabertura' });
      service.transitionStatus(created.id, 'in_progress');
      service.transitionStatus(created.id, 'in_review');
      service.transitionStatus(created.id, 'done');
      const reopened = service.transitionStatus(created.id, 'todo');
      expect(reopened.status).toBe('todo');
    });

    it('rejeita pular etapas: todo -> done diretamente (edge case / regra de negocio)', () => {
      const created = service.create({ title: 'Pular etapa' });
      expect(() => service.transitionStatus(created.id, 'done')).toThrow(ConflictError);
    });

    it('e idempotente quando o status de destino e igual ao atual', () => {
      const created = service.create({ title: 'Idempotente' });
      const result = service.transitionStatus(created.id, 'todo');
      expect(result.status).toBe('todo');
    });

    it('lanca NotFoundError ao transicionar ticket inexistente (edge case)', () => {
      expect(() => service.transitionStatus('nao-existe', 'in_progress')).toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('remove um ticket existente', () => {
      const created = service.create({ title: 'Para deletar' });
      service.delete(created.id);
      expect(() => service.getById(created.id)).toThrow(NotFoundError);
    });

    it('lanca NotFoundError ao deletar ticket inexistente (edge case)', () => {
      expect(() => service.delete('nao-existe')).toThrow(NotFoundError);
    });
  });
});
