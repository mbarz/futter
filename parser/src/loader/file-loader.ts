export interface FileLoader {
  load(source: string): Promise<Buffer>;
}
