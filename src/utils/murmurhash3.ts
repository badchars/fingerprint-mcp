// Pure TypeScript MurmurHash3 x86 32-bit — Shodan-compatible favicon hashing
export function murmurhash3_x86_32(data: Buffer, seed = 0): number {
  const nblocks = Math.floor(data.length / 4);
  let h1 = seed >>> 0;

  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  // Body
  for (let i = 0; i < nblocks; i++) {
    let k1 =
      data[i * 4] |
      (data[i * 4 + 1] << 8) |
      (data[i * 4 + 2] << 16) |
      (data[i * 4 + 3] << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  // Tail
  const tail = nblocks * 4;
  let k1 = 0;

  switch (data.length & 3) {
    case 3:
      k1 ^= data[tail + 2] << 16;
    // fallthrough
    case 2:
      k1 ^= data[tail + 1] << 8;
    // fallthrough
    case 1:
      k1 ^= data[tail];
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
  }

  // Finalization
  h1 ^= data.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 | 0; // Signed 32-bit (Shodan convention)
}

// Shodan favicon hash: base64-encode the raw bytes, then MurmurHash3 the base64 string
export function shodanFaviconHash(rawBytes: Buffer): number {
  const b64 = rawBytes.toString("base64");
  // Shodan uses the base64 string with standard line breaks every 76 chars
  const lines: string[] = [];
  for (let i = 0; i < b64.length; i += 76) {
    lines.push(b64.slice(i, i + 76));
  }
  const encoded = lines.join("\n") + "\n";
  return murmurhash3_x86_32(Buffer.from(encoded));
}
