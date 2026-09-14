import { ValidationError } from '../../src/errors/AppError';
import {
  validateCreateTicketInput,
  validateStatusTransitionBody,
  validateUpdateTicketInput
} from '../../src/validation/ticketValidation';

describe('ticketValidation', () => {
  describe('validateCreateTicketInput', () => {
    it('aceita um payload minimo valido', () => {
      const result = validateCreateTicketInput({ title: 'Titulo valido' });
      expect(result.title).toBe('Titulo valido');
      expect(result.priority).toBe('medium');
    });

    it('rejeita quando title esta ausente', () => {
      expect(() => validateCreateTicketInput({})).toThrow(ValidationError);
    });

    it('rejeita title menor que o minimo (edge case)', () => {
      expect(() => validateCreateTicketInput({ title: 'ab' })).toThrow(ValidationError);
    });

    it('rejeita title maior que o maximo (edge case)', () => {
      const longTitle = 'a'.repeat(121);
      expect(() => validateCreateTicketInput({ title: longTitle })).toThrow(ValidationError);
    });

    it('rejeita priority invalida', () => {
      expect(() => validateCreateTicketInput({ title: 'Valido', priority: 'urgent' })).toThrow(ValidationError);
    });

    it('rejeita corpo que nao e objeto (edge case)', () => {
      expect(() => validateCreateTicketInput('string invalida')).toThrow(ValidationError);
      expect(() => validateCreateTicketInput(null)).toThrow(ValidationError);
    });

    it('rejeita tags com item vazio ou muito longo', () => {
      expect(() => validateCreateTicketInput({ title: 'Valido', tags: [''] })).toThrow(ValidationError);
      expect(() => validateCreateTicketInput({ title: 'Valido', tags: ['a'.repeat(31)] })).toThrow(ValidationError);
    });

    it('aceita tags validas', () => {
      const result = validateCreateTicketInput({ title: 'Valido', tags: ['backend', 'urgente'] });
      expect(result.tags).toEqual(['backend', 'urgente']);
    });
  });

  describe('validateUpdateTicketInput', () => {
    it('rejeita corpo vazio (edge case)', () => {
      expect(() => validateUpdateTicketInput({})).toThrow(ValidationError);
    });

    it('aceita atualizacao parcial valida', () => {
      const result = validateUpdateTicketInput({ priority: 'high' });
      expect(result).toEqual({ priority: 'high' });
    });

    it('rejeita assignee vazio', () => {
      expect(() => validateUpdateTicketInput({ assignee: '' })).toThrow(ValidationError);
    });
  });

  describe('validateStatusTransitionBody', () => {
    it('aceita status valido', () => {
      expect(validateStatusTransitionBody({ status: 'in_progress' })).toBe('in_progress');
    });

    it('rejeita status ausente', () => {
      expect(() => validateStatusTransitionBody({})).toThrow(ValidationError);
    });

    it('rejeita status desconhecido (edge case)', () => {
      expect(() => validateStatusTransitionBody({ status: 'archived' })).toThrow(ValidationError);
    });
  });
});
