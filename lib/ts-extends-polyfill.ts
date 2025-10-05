// Minimal __extends helper used by older TS-compiled libs (Hermes-safe)
// No `any`, no ts-comments, no eslint suppression.

type Ctor = abstract new (...args: never[]) => object;

// Narrowed view of global for storing the helper
interface GlobalWithExtends {
  __extends?: (derived: Ctor, base: Ctor) => void;
}

const g = globalThis as unknown as GlobalWithExtends;

if (typeof g.__extends !== 'function') {
  g.__extends = (derived: Ctor, base: Ctor) => {
    // Ensure statics on the subclass see the base as prototype (best-effort)
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(derived, base);
    } else {
      // Fallback: shallow copy of own props (approximate)
      for (const k of Object.getOwnPropertyNames(base)) {
        if (!Object.prototype.hasOwnProperty.call(derived, k)) {
          const desc = Object.getOwnPropertyDescriptor(base, k);
          if (desc) Object.defineProperty(derived, k, desc);
        }
      }
    }

    // Create a prototype chain: derived.prototype -> base.prototype
    const baseProto = (base as unknown as { prototype: object }).prototype;
    const proto =
      baseProto == null ? Object.create(null) : Object.create(baseProto);

    Object.defineProperty(proto, 'constructor', {
      value: derived,
      writable: true,
      configurable: true,
    });

    (derived as unknown as { prototype: object }).prototype = proto;
  };
}
