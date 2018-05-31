import * as fs from "fs";

import * as Utils from "./utils";
import { Day, Meal } from "./model";
import { Data } from "./config";

const PDF2JSONParser = require("pdf2json/pdfparser");

function openFileBuffer(fileName: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(fileName, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}

type PDFParserResult = {
  domain: any;
  context: any;
  data: PDFData;
  PDFJS: object;
  parseProbcount: number;
};

type PDFData = {
  Transcoder: string;
  Agency: string;
  Id: object;
  Pages: PDFPage[];
  Width: number;
};

type PDFPage = {
  Height: number;
  HLines: never[];
  VLines: never[];
  Fills: {
    x: number;
    y: number;
    h: number;
    clr: number;
  }[];
  Texts: PDFText[];
};

type PDFText = {
  x: number;
  y: number;
  w: number;
  clr: number;
  A: "left" | "right";
  R: {
    T: string;
    S: number;
    TS: number[];
  };
};

class PDFParser {
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

namespace ParseLogic {
  class PDFPlanInterpreter {
    constructor(private pdfData: PDFData) {}

    public getTexts(): Day[] {
      console.log("data ready");

      const pages = this.pdfData.Pages;
      const page = pages[0];

      let json = JSON.stringify(page, null, 2);
      fs.writeFileSync(Data.getPath("data.json"), json);

      const texts = page.Texts;
      const plan: Day[] = [];

      console.log(texts.length + " texts found");
      let { monthOfDate, firstDayOfDate } = this.tryToGetDateFromHeader(texts);
      if (monthOfDate == 0) {
				// if there is no date found, take monday of current week
        const d = new Date();
        const day = d.getDay();
        d.setDate(d.getDate() - (day - 1));
        monthOfDate = d.getMonth() + 1;
        firstDayOfDate = d.getDate();
      }

      const xStart: number = 1.95;
      const dayWidth: number = 28.36;
      const yStart: number = 10.27;
      const dayHeight: number = 4.687;
      for (var key in texts) {
        const text = texts[key];
        const x = text.x;
        const y = text.y;
        const r = text.R[0];
        const value = r.T;

        const dayIndex = Math.floor((Math.ceil(x) - xStart) / dayWidth);
        const mealIndex = Math.floor((y - yStart) / dayHeight);

        if (mealIndex >= 0 && mealIndex < 5 && dayIndex >= 0 && dayIndex < 5) {
          if (!plan[dayIndex]) {
            const daysDate = new Date(
              new Date().getFullYear(),
              monthOfDate - 1,
              firstDayOfDate + dayIndex + 1
            );
            const name = Utils.getDayName(dayIndex);
            const date = daysDate.toISOString().slice(0, 10);
            plan[dayIndex] = new Day(date, name);
          }
          var day = plan[dayIndex];

          const meal = day.getOrCreateMeal(mealIndex);
          const line = decodeURIComponent(value);
          meal.addLine(line);
        }
      }

      console.log("delivering parsed data to listener");

      json = JSON.stringify(plan, null, 2);
      fs.writeFileSync(Data.getPath("plan.json"), json);
      return plan;
    }

    private tryToGetDateFromHeader(texts: PDFText[]) {
      let date = "";
      let firstDayOfDate = 0;
      let monthOfDate = 0;
      for (let key in texts) {
        const text = texts[key];
        const x = text.x;
        const y = text.y;
        const r = text.R[0];
        const value = r.T;
        if (x >= 77 && x <= 100 && y >= 6.8 && y <= 7) {
          date = Utils.convertToHTML(value);
          console.log("date found: " + date);
          var match = date.match(/([0-9]{2}).([0-9]{2}).[0-9]{4} /);
          console.log(match);
          firstDayOfDate = parseInt(match[1]);
          monthOfDate = parseInt(match[2]);
          console.log("first: " + firstDayOfDate);
          console.log("month: " + monthOfDate);
        }
      }
      return { monthOfDate, firstDayOfDate };
    }
  }
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
      return new PDFPlanInterpreter(data).getTexts();
    }

    private onPFBinDataError(error) {
      console.error("an error occured");
      console.error(error);
    }
  }
}

export = ParseLogic;
