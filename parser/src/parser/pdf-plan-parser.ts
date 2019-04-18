import { Day } from "../model";
import { PDFParser } from "./pdf-parser";
import { PDFParserResult } from "./model";
import { PDFPlanReader } from "./pdf-plan-reader";
import { LocalFileLoader } from "./file-loader-local";

export class PDFPlanParser {
  constructor(private reader: PDFPlanReader) {}

  public async parseFile(fileName: string): Promise<Day[]> {
    const parser = new PDFParser();
    const loader = new LocalFileLoader();
    const buffer = await loader.load(fileName);
    return parser
      .parseBuffer(buffer)
      .then(result => this.interpreteTexts(result))
      .catch(err => {
        this.onPFBinDataError(err);
        return [];
      });
  }

  public parse(data: string): Promise<Day[]> {
    const parser = new PDFParser();
    return parser
      .parsePDFString(data)
      .then(result => this.interpreteTexts(result))
      .catch(err => {
        this.onPFBinDataError(err);
        return [];
      });
  }

  private interpreteTexts(data: PDFParserResult): Day[] {
    return this.reader.getTexts(data);
  }

  private onPFBinDataError(error) {
    console.error("an error occured");
    console.error(error);
  }
}
