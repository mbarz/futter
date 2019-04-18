import { writeFileSync, readFileSync } from "fs";
import { PDFParser } from "./pdf-parser";
import { LocalFileLoader } from "./file-loader-local";

describe("parser", () => {
  it("should parse", async () => {
    const loader = new LocalFileLoader();
    const parser = new PDFParser();

    const source = `res/example.pdf`;
    const buffer = await loader.load(source);
    const parsed = await parser.parseBuffer(buffer);

    // writeFileSync("out/parsed.json", JSON.stringify(parsed, null, 2), "utf8");
    const expected = JSON.parse(
      readFileSync("res/example-parse-result.json", "utf8")
    );

    const csv = parsed.Texts.map((t, i) => ({
      t1: t,
      t2: expected.data.Pages[0].Texts[i]
    }))
      .map(({ t1, t2 }) => [t1.R[0].T, t1.x, t2.R[0].T, t2.x])
      .map(data => data.join(","))
      .join("\n");

    // writeFileSync("out/comparement.csv", csv, "utf8");

    // expect(parsed).toEqual(expected);
  });
});
