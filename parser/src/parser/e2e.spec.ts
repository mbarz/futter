import { writeFileSync, readFileSync } from "fs";
import { PDFPlanReader } from "./pdf-plan-reader";
import { LocalFileLoader } from "../loader/file-loader-local";
import { PDFParser } from "./pdf-parser";

describe("parser", () => {
  it("should parse", async () => {
    const source = `res/example.pdf`;
    const target = `out/test-result.json`;
    const loader = new LocalFileLoader();
    const reader = new PDFPlanReader();
    const parser = new PDFParser();
    const result = await loader
      .load(source)
      .then(buffer => parser.parse(buffer))
      .then(page => reader.getTexts(page));
    // console.log(result);
    // // writeFileSync(target, JSON.stringify(result, null, 2));
    // const actual = JSON.parse(readFileSync(target, "utf8"));
    const expected = JSON.parse(readFileSync("res/example-plan.json", "utf8"));
    expect(JSON.parse(JSON.stringify(result))).toEqual(expected);
  });
});
