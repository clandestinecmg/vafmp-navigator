// Adds minor type and runtime safety helpers

declare global {
  interface Array<T> {
    first(): T | undefined;
    last(): T | undefined;
  }
}

if (!Array.prototype.first) {
  Array.prototype.first = function () {
    return this.length > 0 ? this[0] : undefined;
  };
}

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this.length > 0 ? this[this.length - 1] : undefined;
  };
}

export {};
