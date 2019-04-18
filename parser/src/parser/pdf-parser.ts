import * as fs from "fs";
import { PDF2JSONResult, PDFParserResult } from "./model";
import { Subject } from "rxjs";

const PDF2JSONParser = require("pdf2json/pdfparser");

export class PDFParser {
  constructor() {}

  public parsePDFString(pdf: string): Promise<PDFParserResult> {
    const buffer = new Buffer(pdf);
    return this.parseBuffer(buffer);
  }

  public async parseBuffer(buffer: Buffer): Promise<PDFParserResult> {
    const { formImage } = await this.parsePDF2JSON(buffer);
    const page = formImage.Pages[0];

    // adjust x coordinate to match older version
    for (const text of page.Texts) {
      text.x = (144.7 / formImage.Width) * text.x + 0.436;
    }
    return page;
  }

  private parsePDF2JSON(buffer: Buffer) {
    const s = new Subject<PDF2JSONResult>();
    const pdf2Json = new PDF2JSONParser();
    pdf2Json.on("pdfParser_dataReady", data => {
      s.next(data);
      s.complete();
    });
    pdf2Json.on("pdfParser_dataError", error => s.error(error));
    pdf2Json.parseBuffer(buffer);
    return s.toPromise();
  }
}
