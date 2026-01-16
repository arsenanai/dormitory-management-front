/// <reference types="vitest/globals" />

// Polyfill for global URL in Vitest/JSDOM
globalThis.URL = globalThis.URL ?? (typeof require !== 'undefined' ? require('url').URL : globalThis.URL);
