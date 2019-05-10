import { pdfBuffer2json } from "./pdf-to-json";

export type Text = { x: number; y: number; w: number; R: { T }[] };
export type PDFParserResult = { texts: Text[] };

export class PDFParser {
  constructor() {}

  public async parse(buffer: Buffer): Promise<PDFParserResult> {
    const { formImage } = await pdfBuffer2json(buffer);
    const page = formImage.Pages[0];

    // adjust x coordinate to match older version
    for (const text of page.Texts) {
      text.x = (144.7 / formImage.Width) * text.x + 0.436;
    }
    return { texts: page.Texts.map(t => ({ x: t.x, y: t.y, w: t.w, R: t.R })) };
  }
}
