import '@testing-library/jest-dom';

// Mock Supabase client
const mockTasks = [
  { id: '1', title: 'Backend Task', description: 'Desc', priority: 'HIGH', completed: false, user_id: 'test', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' }
];

jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: function() {
      return {
        from: function() {
          return {
            select: jest.fn(function() { return this; }),
            eq: jest.fn(function() { return this; }),
            order: jest.fn(function() { return this; }),
            insert: jest.fn(function() { return this; }),
            update: jest.fn(function() { return this; }),
            delete: jest.fn(function() { return this; }),
            single: jest.fn().mockResolvedValue({ data: mockTasks[0], error: null }),
            then: function(resolve) { resolve({ data: mockTasks, error: null }); }
          };
        }
      };
    }
  };
});

// Mock localStorage
import './src/__mocks__/localStorage';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});
