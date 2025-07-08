// Polyfill for global URL in Vitest/JSDOM
globalThis.URL = globalThis.URL || require('url').URL;
