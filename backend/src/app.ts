import * as fs from "fs";
import { Data } from "./config";
import * as beautify from "js-beautify";
import { HTMLPlanGenerator } from "./HTMLLogic";
import { Day } from "./model";
import { PDFPlanParser } from "./parseLogic";
import { Restaurant } from "./restaurant";
import { WeekNr } from "./weekNr";
import * as Download from "./download";

console.log(
  "------------------------ futterParser 1.0 ----------------------\n"
);

const argv = process.argv;
const index = argv.indexOf("-o");
if (index >= 0 && argv.length > index) {
  Data.OUTDIR = argv[index + 1];
}

console.log(`target directory is ${Data.OUTDIR}`);

class MainProgram {
  public async run() {
    let bigPlan: {
      [key: string]: {
        plans: {
          [lang: string]: Day[];
        };
      };
    } = {};

    const bwg = await this.load(Restaurant.BWG);
    const bln = await this.load(Restaurant.BLN_K);
    const mch = await this.load(Restaurant.MCH_P);

    bigPlan = {
      bwg: { plans: bwg },
      bln: { plans: bln }
      // 'mch': { plans: mch }
    };

    const gen = new HTMLPlanGenerator();
    let html = gen.generate(bwg["de"]);
    html = html.replace(/\n\s+/g, "\n"); // remove all current indention
    html = beautify.html_beautify(html);

    console.log("done\n");

    const jsonFilePath = Data.JSONFILEPATH;
    console.log("writing big multi language plan to " + jsonFilePath + "...");
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(
        {
          ...bigPlan,
          generationTimestamp: new Date()
        },
        null,
        2
      )
    );

    const htmlFilePath = Data.HTMLFILEPATH;
    console.log(`writing ready to use html to ${htmlFilePath}...`);
    var file = fs.createWriteStream(htmlFilePath);
    file.write(html);
    file.end();

    console.log("done\n");
    console.log(
      `everything's done. You can use ${htmlFilePath} or ${jsonFilePath} now`
    );
  }

  async load(restaurant: Restaurant): Promise<{ [lang: string]: Day[] }> {
    const de = await this.loadLang(restaurant, "de");
    const en = await this.loadLang(restaurant, "en");
    return {
      de: de,
      en: en
    };
  }

  async loadLang(restaurant: Restaurant, lang: "de" | "en"): Promise<Day[]> {
    const file1 = await Download.load(restaurant, WeekNr.now(), lang);
    const file2 = await Download.load(restaurant, WeekNr.now() + 1, lang);

    var parser = new PDFPlanParser();
    const data1 = await parser.parseFile(file1);
    const data2 = await parser.parseFile(file2);

    return [...data1, ...data2];
  }
}

var m = new MainProgram();
m.run();
