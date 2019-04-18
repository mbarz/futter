import * as fs from "fs";
import { FileLoader } from "./file-loader";

export class LocalFileLoader implements FileLoader {
  load(fileName: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      fs.readFile(fileName, (err, buffer) =>
        err ? reject(err) : resolve(buffer)
      );
    });
  }
}
