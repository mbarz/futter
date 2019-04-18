import { Subject } from "rxjs";
import * as PDF2JSONParser from "pdf2json/pdfparser";

export interface PDF2JSONResult {
  formImage: FormImage;
}

export interface FormImage {
  Transcoder: string;
  Agency: string;
  Id: ID;
  Pages: Page[];
  Width: number;
}

export interface ID {
  AgencyId: string;
  Name: string;
  MC: boolean;
  Max: number;
  Parent: string;
}

export interface Page {
  Height: number;
  HLines: Line[];
  VLines: Line[];
  Fills: Fill[];
  Texts: Text[];
  Fields: any[];
  Boxsets: any[];
}

export interface Fill {
  x: number;
  y: number;
  w: number;
  h: number;
  clr: number;
}

export interface Line {
  x: number;
  y: number;
  w: number;
  l: number;
}

export interface Text {
  x: number;
  y: number;
  w: number;
  sw: number;
  clr: number;
  A: A;
  R: R[];
  oc?: string;
}

export enum A {
  Left = "left"
}

export interface R {
  T: string;
  S: number;
  TS: number[];
}

export function pdfBuffer2json(buffer: Buffer) {
  const s = new Subject<PDF2JSONResult>();
  const pdf2Json = new PDF2JSONParser();
  pdf2Json.on("pdfParser_dataReady", data => {
    console.log("received data");
    s.next(data);
    s.complete();
  });
  pdf2Json.on("pdfParser_dataError", error => s.error(error));
  try {
    console.log(`starting to parse buffer with length ${buffer.byteLength}`);
    pdf2Json.parseBuffer(buffer);
  } catch (error) {
    s.error(error);
  }
  return s.toPromise();
}
