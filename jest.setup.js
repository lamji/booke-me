import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing-library to use 'data-test-id' as requested by the user
configure({ testIdAttribute: 'data-test-id' });

// Polyfill TextEncoder and TextDecoder for JSDOM
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill fetch if needed
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
}
