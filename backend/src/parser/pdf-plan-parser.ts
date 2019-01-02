import { Day } from "../model";
import { PDFParser } from "./pdf-parser";
import { PDFData } from "./model";
import { PDFPlanReader } from "./pdf-plan-reader";

export class PDFPlanParser {
  constructor() {}

  public parseFile(fileName: string): Promise<Day[]> {
    const parser = new PDFParser();
    return parser
      .parseFile(fileName)
      .then(result => this.interpreteTexts(result.data))
      .catch(err => {
        this.onPFBinDataError(err);
        return [];
      });
  }

  public parse(data: string): Promise<Day[]> {
    const parser = new PDFParser();
    return parser
      .parsePDFString(data)
      .then(result => this.interpreteTexts(result.data))
      .catch(err => {
        this.onPFBinDataError(err);
        return [];
      });
  }

  private interpreteTexts(data: PDFData): Day[] {
    return new PDFPlanReader(data).getTexts();
  }

  private onPFBinDataError(error) {
    console.error("an error occured");
    console.error(error);
  }
}
