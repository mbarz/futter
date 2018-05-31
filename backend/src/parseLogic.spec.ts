import { PDFPlanParser } from "./parseLogic";
import { writeFileSync } from "fs";

async function test() {
  const parser = new PDFPlanParser();
  const result = await parser.parseFile(`${__dirname}/../out/bwg_a_de_022.pdf`);
  writeFileSync(`${__dirname}/../out/test-result.json`, JSON.stringify(result, null, 2));
}

test();
