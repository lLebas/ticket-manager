import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../src/app';
import { TicketRepository } from '../../src/repository/ticketRepository';

describe('Ticket routes (integracao)', () => {
  let app: Express;
  let repository: TicketRepository;

  beforeEach(() => {
    repository = new TicketRepository();
    app = createApp(repository);
  });

  describe('GET /health', () => {
    it('retorna 200 e status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/tickets', () => {
    it('cria um ticket e retorna 201', async () => {
      const res = await request(app).post('/api/tickets').send({ title: 'Novo ticket' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ title: 'Novo ticket', status: 'todo', priority: 'medium' });
    });

    it('retorna 400 com detalhes de campo quando title esta ausente (edge case)', async () => {
      const res = await request(app).post('/api/tickets').send({});
      expect(res.status).toBe(400);
      expect(res.body.details).toHaveProperty('title');
    });

    it('retorna 400 quando priority e invalida', async () => {
      const res = await request(app).post('/api/tickets').send({ title: 'Valido', priority: 'urgentissimo' });
      expect(res.status).toBe(400);
      expect(res.body.details).toHaveProperty('priority');
    });
  });

  describe('GET /api/tickets', () => {
    it('lista tickets com metadados de paginacao', async () => {
      await request(app).post('/api/tickets').send({ title: 'Ticket 1' });
      await request(app).post('/api/tickets').send({ title: 'Ticket 2', priority: 'high' });

      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.items).toHaveLength(2);
    });

    it('filtra por query string (priority)', async () => {
      await request(app).post('/api/tickets').send({ title: 'Ticket baixo', priority: 'low' });
      await request(app).post('/api/tickets').send({ title: 'Ticket alto', priority: 'high' });

      const res = await request(app).get('/api/tickets').query({ priority: 'high' });
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.items[0].priority).toBe('high');
    });

    it('retorna lista vazia quando nao ha tickets (edge case)', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.items).toEqual([]);
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('retorna 404 para id inexistente (edge case)', async () => {
      const res = await request(app).get('/api/tickets/id-que-nao-existe');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NotFoundError');
    });

    it('retorna o ticket correspondente', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Buscar este' });
      const res = await request(app).get(`/api/tickets/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
    });
  });

  describe('PATCH /api/tickets/:id', () => {
    it('atualiza campos parciais', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Original' });
      const res = await request(app).patch(`/api/tickets/${created.body.id}`).send({ assignee: 'lebas' });
      expect(res.status).toBe(200);
      expect(res.body.assignee).toBe('lebas');
      expect(res.body.title).toBe('Original');
    });

    it('retorna 404 ao atualizar ticket inexistente', async () => {
      const res = await request(app).patch('/api/tickets/nao-existe').send({ title: 'Titulo valido' });
      expect(res.status).toBe(404);
    });

    it('retorna 400 quando o corpo esta vazio (edge case)', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Original' });
      const res = await request(app).patch(`/api/tickets/${created.body.id}`).send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/tickets/:id/status', () => {
    it('permite transicao valida todo -> in_progress', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Transicao' });
      const res = await request(app)
        .patch(`/api/tickets/${created.body.id}/status`)
        .send({ status: 'in_progress' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('in_progress');
    });

    it('retorna 409 para transicao invalida todo -> done (edge case / regra de negocio)', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Transicao invalida' });
      const res = await request(app).patch(`/api/tickets/${created.body.id}/status`).send({ status: 'done' });
      expect(res.status).toBe(409);
      expect(res.body.details).toMatchObject({ from: 'todo', to: 'done' });
    });

    it('retorna 400 para valor de status desconhecido', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Status invalido' });
      const res = await request(app).patch(`/api/tickets/${created.body.id}/status`).send({ status: 'archived' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    it('remove o ticket e retorna 204', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Deletar' });
      const res = await request(app).delete(`/api/tickets/${created.body.id}`);
      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/api/tickets/${created.body.id}`);
      expect(getRes.status).toBe(404);
    });

    it('retorna 404 ao deletar ticket ja removido (edge case)', async () => {
      const created = await request(app).post('/api/tickets').send({ title: 'Deletar duas vezes' });
      await request(app).delete(`/api/tickets/${created.body.id}`);
      const res = await request(app).delete(`/api/tickets/${created.body.id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('corpo JSON malformado', () => {
    it('retorna 400 ValidationError em vez de 500 (edge case)', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('Content-Type', 'application/json')
        .send('{"title":');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ValidationError');
      expect(res.body.details).toEqual({ body: 'JSON malformado' });
    });
  });

  describe('rota desconhecida', () => {
    it('retorna 404 padronizado (edge case)', async () => {
      const res = await request(app).get('/rota/que/nao/existe');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NotFoundError');
    });
  });
});
