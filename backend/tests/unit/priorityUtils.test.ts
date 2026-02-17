import { normalizePriority } from '../../src/utils/priorityUtils';

describe('normalizePriority', () => {
  test('convierte prioridades en español a inglés', () => {
    expect(normalizePriority('alta')).toBe('HIGH');
    expect(normalizePriority('media')).toBe('MEDIUM');
    expect(normalizePriority('baja')).toBe('LOW');
    expect(normalizePriority('urgente')).toBe('URGENT');
  });

  test('convierte prioridades en inglés (mantiene igual)', () => {
    expect(normalizePriority('high')).toBe('HIGH');
    expect(normalizePriority('medium')).toBe('MEDIUM');
    expect(normalizePriority('low')).toBe('LOW');
    expect(normalizePriority('urgent')).toBe('URGENT');
  });

  test('convierte a minúsculas automáticamente', () => {
    expect(normalizePriority('ALTA')).toBe('HIGH');
    expect(normalizePriority('Media')).toBe('MEDIUM');
    expect(normalizePriority('BAJA')).toBe('LOW');
  });

  test('retorna MEDIUM por defecto para valores desconocidos', () => {
    expect(normalizePriority('desconocido')).toBe('MEDIUM');
    expect(normalizePriority('')).toBe('MEDIUM');
    expect(normalizePriority('random')).toBe('MEDIUM');
  });
});
