// lib/global-shim.ts
// Minimal Crypto shims for RN/Hermes environments without built-ins.
// No `any`, no ts-comments, strict types.

function fillPseudoRandom<T extends ArrayBufferView | null>(array: T): T {
  if (array === null) {
    // Mirror browser behavior: throw when null is passed.
    throw new TypeError(
      "Failed to execute 'getRandomValues': parameter 1 is not an object.",
    );
  }
  const u8 =
    array instanceof Uint8Array
      ? array
      : new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  for (let i = 0; i < u8.length; i += 1) {
    u8[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

type UuidString = `${string}-${string}-${string}-${string}-${string}`;

function makeUuidV4(): UuidString {
  const b = new Uint8Array(16);
  // Fill with pseudo-random bytes (adequate for ids; not crypto-secure)
  fillPseudoRandom(b);

  // RFC 4122 v4: set version and variant bits
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;

  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex
    .slice(4, 6)
    .join('')}-${hex.slice(6, 8).join('')}-${hex
    .slice(8, 10)
    .join('')}-${hex.slice(10, 16).join('')}` as UuidString;
}

(function ensureCrypto(): void {
  const g = globalThis as { crypto?: Crypto };

  // If no crypto object at all, create one with required keys
  if (!g.crypto) {
    const poly: Pick<Crypto, 'getRandomValues' | 'randomUUID' | 'subtle'> = {
      // ✔ exact DOM signature: <T extends ArrayBufferView | null>(array: T) => T
      getRandomValues: <T extends ArrayBufferView | null>(array: T): T =>
        fillPseudoRandom(array),
      // ✔ returns the template literal type the DOM expects
      randomUUID: makeUuidV4,
      // Present only to satisfy type; not implemented here
      subtle: undefined as unknown as SubtleCrypto,
    };
    g.crypto = poly as unknown as Crypto;
    return;
  }

  // Patch missing methods on an existing crypto object
  const c = g.crypto;

  if (!('getRandomValues' in c) || typeof c.getRandomValues !== 'function') {
    (c as Pick<Crypto, 'getRandomValues'>).getRandomValues = <
      T extends ArrayBufferView | null,
    >(
      array: T,
    ): T => fillPseudoRandom(array);
  }

  if (!('randomUUID' in c) || typeof c.randomUUID !== 'function') {
    (c as Pick<Crypto, 'randomUUID'>).randomUUID = makeUuidV4;
  }
})();
