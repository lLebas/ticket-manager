import express, { Express } from 'express';
import { TicketController } from './controllers/ticketController';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { TicketRepository } from './repository/ticketRepository';
import { TicketService } from './services/ticketService';

export function createApp(repository: TicketRepository = new TicketRepository()): Express {
  const app = express();
  app.use(express.json());

  const service = new TicketService(repository);
  const controller = new TicketController(service);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const router = express.Router();
  router.post('/tickets', controller.create);
  router.get('/tickets', controller.list);
  router.get('/tickets/:id', controller.getById);
  router.patch('/tickets/:id', controller.update);
  router.patch('/tickets/:id/status', controller.transitionStatus);
  router.delete('/tickets/:id', controller.delete);

  app.use('/api', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
