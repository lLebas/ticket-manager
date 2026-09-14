import {
  CreateTicketInput,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketPriority,
  TicketStatus,
  UpdateTicketInput
} from '../domain/ticket';
import { ValidationError } from '../errors/AppError';

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;
const ASSIGNEE_MAX = 80;
const MAX_TAGS = 10;
const TAG_MAX = 30;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateTitle(title: unknown, errors: Record<string, string>): void {
  if (title === undefined) return;
  if (!isNonEmptyString(title)) {
    errors.title = 'title deve ser uma string nao vazia';
    return;
  }
  const trimmed = (title as string).trim();
  if (trimmed.length < TITLE_MIN || trimmed.length > TITLE_MAX) {
    errors.title = `title deve ter entre ${TITLE_MIN} e ${TITLE_MAX} caracteres`;
  }
}

export function validateDescription(description: unknown, errors: Record<string, string>): void {
  if (description === undefined || description === null) return;
  if (typeof description !== 'string') {
    errors.description = 'description deve ser uma string';
    return;
  }
  if (description.length > DESCRIPTION_MAX) {
    errors.description = `description deve ter no maximo ${DESCRIPTION_MAX} caracteres`;
  }
}

export function validatePriority(priority: unknown, errors: Record<string, string>): void {
  if (priority === undefined) return;
  if (!TICKET_PRIORITIES.includes(priority as TicketPriority)) {
    errors.priority = `priority deve ser um dos valores: ${TICKET_PRIORITIES.join(', ')}`;
  }
}

export function validateAssignee(assignee: unknown, errors: Record<string, string>): void {
  if (assignee === undefined || assignee === null) return;
  if (typeof assignee !== 'string' || assignee.trim().length === 0) {
    errors.assignee = 'assignee deve ser uma string nao vazia (ou null)';
    return;
  }
  if (assignee.length > ASSIGNEE_MAX) {
    errors.assignee = `assignee deve ter no maximo ${ASSIGNEE_MAX} caracteres`;
  }
}

export function validateTags(tags: unknown, errors: Record<string, string>): void {
  if (tags === undefined) return;
  if (!Array.isArray(tags)) {
    errors.tags = 'tags deve ser um array de strings';
    return;
  }
  if (tags.length > MAX_TAGS) {
    errors.tags = `tags deve ter no maximo ${MAX_TAGS} itens`;
    return;
  }
  const invalid = tags.some((t) => typeof t !== 'string' || t.length === 0 || t.length > TAG_MAX);
  if (invalid) {
    errors.tags = `cada tag deve ser uma string de 1 a ${TAG_MAX} caracteres`;
  }
}

export function validateStatusValue(status: unknown, errors: Record<string, string>): void {
  if (!TICKET_STATUSES.includes(status as TicketStatus)) {
    errors.status = `status deve ser um dos valores: ${TICKET_STATUSES.join(', ')}`;
  }
}

export function validateCreateTicketInput(body: unknown): CreateTicketInput {
  const errors: Record<string, string> = {};
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('corpo da requisicao invalido', { body: 'esperado um objeto JSON' });
  }
  const input = body as Record<string, unknown>;

  if (input.title === undefined) {
    errors.title = 'title e obrigatorio';
  } else {
    validateTitle(input.title, errors);
  }
  validateDescription(input.description, errors);
  validatePriority(input.priority, errors);
  validateAssignee(input.assignee, errors);
  validateTags(input.tags, errors);

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('falha de validacao', errors);
  }

  return {
    title: (input.title as string).trim(),
    description: input.description === undefined ? null : (input.description as string | null),
    priority: (input.priority as TicketPriority) ?? 'medium',
    assignee: input.assignee === undefined ? null : (input.assignee as string | null),
    tags: (input.tags as string[]) ?? []
  };
}

export function validateUpdateTicketInput(body: unknown): UpdateTicketInput {
  const errors: Record<string, string> = {};
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('corpo da requisicao invalido', { body: 'esperado um objeto JSON' });
  }
  const input = body as Record<string, unknown>;

  if (Object.keys(input).length === 0) {
    throw new ValidationError('corpo da requisicao vazio: informe ao menos um campo para atualizar');
  }

  validateTitle(input.title, errors);
  validateDescription(input.description, errors);
  validatePriority(input.priority, errors);
  validateAssignee(input.assignee, errors);
  validateTags(input.tags, errors);

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('falha de validacao', errors);
  }

  const update: UpdateTicketInput = {};
  if (input.title !== undefined) update.title = (input.title as string).trim();
  if (input.description !== undefined) update.description = input.description as string | null;
  if (input.priority !== undefined) update.priority = input.priority as TicketPriority;
  if (input.assignee !== undefined) update.assignee = input.assignee as string | null;
  if (input.tags !== undefined) update.tags = input.tags as string[];
  return update;
}

export function validateStatusTransitionBody(body: unknown): TicketStatus {
  const errors: Record<string, string> = {};
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('corpo da requisicao invalido', { body: 'esperado um objeto JSON' });
  }
  const input = body as Record<string, unknown>;
  if (input.status === undefined) {
    errors.status = 'status e obrigatorio';
  } else {
    validateStatusValue(input.status, errors);
  }
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('falha de validacao', errors);
  }
  return input.status as TicketStatus;
}
