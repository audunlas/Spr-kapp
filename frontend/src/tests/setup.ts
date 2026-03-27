import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "./mocks/server";

// React Router v7 uses the Navigation API; provide a minimal stub so jsdom
// doesn't print "Not implemented: navigation to another Document" warnings.
const navStub = {
  navigate: vi.fn().mockReturnValue({
    committed: Promise.resolve(undefined),
    finished: Promise.resolve(undefined),
  }),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentEntry: null,
  entries: () => [],
  back: vi.fn(),
  forward: vi.fn(),
  reload: vi.fn(),
  updateCurrentEntry: vi.fn(),
  canGoBack: false,
  canGoForward: false,
  transition: null,
};
Object.defineProperty(window, "navigation", {
  value: navStub,
  writable: true,
  configurable: true,
});

// Provide a working localStorage in jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => localStorageMock.clear());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
