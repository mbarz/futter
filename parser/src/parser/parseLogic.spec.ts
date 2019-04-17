import { writeFileSync } from "fs";
import { PDFPlanParser } from "./pdf-plan-parser";

const id = "bwg_a_de_001";
const source = `${__dirname}/../../out/${id}.pdf`;
const target = `${__dirname}/../../out/${id}.json`;

async function test() {
  const parser = new PDFPlanParser();
  const result = await parser.parseFile(source);
  writeFileSync(target, JSON.stringify(result, null, 2));
}

test();
