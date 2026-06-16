/**
 * TextDecoder utf-16le 폴리필.
 *
 * Hermes(+Expo winter)의 TextDecoder는 utf-8만 지원한다. 그런데 h3-js의
 * emscripten 빌드는 모듈 로드 시점에 `new TextDecoder('utf-16le')`를 생성하므로
 * Hermes에서 "Unknown encoding: utf-16le" RangeError로 앱이 죽는다.
 *
 * 여기서 global.TextDecoder를 감싸 utf-16le 계열 라벨은 JS로 직접 디코드하고,
 * utf-8은 기존(네이티브) 디코더에 위임한다.
 * index.ts에서 expo 초기화 직후·앱 코드(h3-js) 로드 직전에 import 한다.
 */

const g = globalThis as unknown as { TextDecoder?: typeof TextDecoder };
const Native = g.TextDecoder;

function supportsUtf16(Ctor: typeof TextDecoder): boolean {
  try {
    new Ctor('utf-16le');
    return true;
  } catch {
    return false;
  }
}

if (Native && !supportsUtf16(Native)) {
  const UTF16_LABELS = new Set([
    'utf-16le',
    'utf-16',
    'utf16le',
    'ucs-2',
    'ucs2',
    'unicode',
  ]);

  const toBytes = (input?: ArrayBuffer | ArrayBufferView): Uint8Array => {
    if (!input) return new Uint8Array(0);
    if (input instanceof Uint8Array) return input;
    if (ArrayBuffer.isView(input)) {
      return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    }
    return new Uint8Array(input);
  };

  const decodeUtf16le = (bytes: Uint8Array): string => {
    let out = '';
    for (let i = 0; i + 1 < bytes.length; i += 2) {
      out += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
    }
    return out;
  };

  class PatchedTextDecoder {
    readonly encoding: string;
    readonly fatal = false;
    readonly ignoreBOM = false;

    constructor(label: string = 'utf-8') {
      this.encoding = String(label).toLowerCase();
    }

    decode(input?: ArrayBuffer | ArrayBufferView): string {
      const bytes = toBytes(input);
      if (UTF16_LABELS.has(this.encoding)) return decodeUtf16le(bytes);
      return new Native!().decode(bytes); // utf-8 위임
    }
  }

  g.TextDecoder = PatchedTextDecoder as unknown as typeof TextDecoder;
}
