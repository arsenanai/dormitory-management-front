// This file is loaded by vitest.config.ts before all tests
// It provides URL polyfill that JSDOM doesn't include by default

// Polyfill for URL which is needed by axios
if (typeof globalThis.URL !== 'function') {
  const { URL } = require('url');
  globalThis.URL = URL;
}

// Add missing methods to URL if they don't exist
globalThis.URL.createObjectURL = globalThis.URL.createObjectURL || function() { return 'mock://url'; };
globalThis.URL.revokeObjectURL = globalThis.URL.revokeObjectURL || function() {};
