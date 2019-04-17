import { writeFileSync, readFileSync } from "fs";
import { PDFPlanParser } from "./pdf-plan-parser";
import { PDFPlanReader } from "./pdf-plan-reader";

describe("parser", () => {
  it("should parse", async () => {
    const source = `res/example.pdf`;
    const target = `out/test-result.json`;
    const reader = new PDFPlanReader();
    const parser = new PDFPlanParser(reader);
    const result = await parser.parseFile(source);
    writeFileSync(target, JSON.stringify(result, null, 2));
    const actual = JSON.parse(readFileSync(target, "utf8"));
    const expected = JSON.parse(readFileSync("res/example-plan.json", "utf8"));
    expect(actual).toEqual(expected);
  });
});
