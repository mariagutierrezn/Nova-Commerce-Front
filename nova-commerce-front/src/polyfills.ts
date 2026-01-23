/**
 * Polyfills para compatibilidad con bibliotecas Node.js en el navegador
 */

// Polyfill para 'global' (requerido por SockJS y otras librerías Node.js)
(globalThis as any).global = globalThis;

// Polyfill para 'process' (usado por algunas librerías)
(globalThis as any).process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (fn: Function) => setTimeout(fn, 0)
};

// Polyfill para 'Buffer' si es necesario
if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = {
    isBuffer: () => false
  };
}
