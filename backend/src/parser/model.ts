export type PDFParserResult = {
  domain: any;
  context: any;
  data: PDFData;
  PDFJS: object;
  parseProbcount: number;
};

export type PDFData = {
  Transcoder: string;
  Agency: string;
  Id: object;
  Pages: PDFPage[];
  Width: number;
};

export type PDFPage = {
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

export type PDFText = {
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
