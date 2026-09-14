import { Request, Response } from 'express';
import { TicketFilters, TicketPriority, TicketStatus } from '../domain/ticket';
import { TicketService } from '../services/ticketService';
import {
  validateCreateTicketInput,
  validateStatusTransitionBody,
  validateUpdateTicketInput
} from '../validation/ticketValidation';

export class TicketController {
  constructor(private readonly service: TicketService) {}

  create = (req: Request, res: Response): void => {
    const input = validateCreateTicketInput(req.body);
    const ticket = this.service.create(input);
    res.status(201).json(ticket);
  };

  list = (req: Request, res: Response): void => {
    const filters: TicketFilters = {
      status: req.query.status as TicketStatus | undefined,
      priority: req.query.priority as TicketPriority | undefined,
      assignee: req.query.assignee as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
    };
    const result = this.service.list(filters);
    res.status(200).json(result);
  };

  getById = (req: Request, res: Response): void => {
    const ticket = this.service.getById(req.params.id);
    res.status(200).json(ticket);
  };

  update = (req: Request, res: Response): void => {
    const changes = validateUpdateTicketInput(req.body);
    const ticket = this.service.update(req.params.id, changes);
    res.status(200).json(ticket);
  };

  transitionStatus = (req: Request, res: Response): void => {
    const nextStatus = validateStatusTransitionBody(req.body);
    const ticket = this.service.transitionStatus(req.params.id, nextStatus);
    res.status(200).json(ticket);
  };

  delete = (req: Request, res: Response): void => {
    this.service.delete(req.params.id);
    res.status(204).send();
  };
}
