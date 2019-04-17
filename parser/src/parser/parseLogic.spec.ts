import { writeFileSync, readFileSync } from "fs";
import { PDFPlanParser } from "./pdf-plan-parser";

describe("parser", () => {
  it("should parse", async () => {
    const source = `res/example.pdf`;
    const target = `out/test-result.json`;
    const parser = new PDFPlanParser();
    const result = await parser.parseFile(source);
    writeFileSync(target, JSON.stringify(result, null, 2));
    const actual = JSON.parse(readFileSync(target, "utf8"));
    const expected = JSON.parse(
      readFileSync("res/parsed-example.json", "utf8")
    );
    expect(actual).toEqual(expected);
  });
});
