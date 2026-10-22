declare module 'yazl' {
  import type { Readable } from 'node:stream';
  export class ZipFile {
    outputStream: Readable;
    addFile(path: string, name: string, options?: { compress?: boolean }): void;
    addBuffer(buffer: Buffer, name: string, options?: { compress?: boolean }): void;
    addReadStream(stream: Readable, name: string, options?: { size?: number; compress?: boolean }): void;
    end(): void;
  }
}
