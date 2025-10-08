// lib/global-shim.ts
// Basic global shims to ensure safe Hermes runtime and RN polyfills

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Platform } from 'react-native';

if (typeof global.atob === 'undefined') {
  global.atob = (input: string) =>
    Buffer.from(input, 'base64').toString('binary');
}

if (typeof global.btoa === 'undefined') {
  global.btoa = (input: string) =>
    Buffer.from(input, 'binary').toString('base64');
}

global.process = global.process || {};
global.process.env = global.process.env || {};

// Safe console guard
if (!global.console) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.console = { log: () => {}, warn: () => {}, error: () => {} } as any;
}

export {};
