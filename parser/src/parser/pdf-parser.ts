import * as fs from "fs";
import { PDFParserResult } from "./model";

const PDF2JSONParser = require("pdf2json/pdfparser");

export class PDFParser {
  constructor() {}

  public parsePDFString(pdf: string): Promise<PDFParserResult> {
    const buffer = new Buffer(pdf);
    return this.parseBuffer(buffer);
  }

  public parseBuffer(buffer: Buffer): Promise<PDFParserResult> {
    return new Promise<PDFParserResult>((resolve, reject) => {
      const pdfParser = new PDF2JSONParser();
      pdfParser.on("pdfParser_dataReady", data => resolve(data));
      pdfParser.on("pdfParser_dataError", err => reject(err));
      try {
        pdfParser.parseBuffer(buffer);
      } catch (e) {
        console.error("parseError");
      }
    });
  }

  public parseFile(fileName: string): Promise<PDFParserResult> {
    return openFileBuffer(fileName).then(pdfBuffer =>
      this.parseBuffer(pdfBuffer)
    );
  }
}

function openFileBuffer(fileName: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(fileName, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}
