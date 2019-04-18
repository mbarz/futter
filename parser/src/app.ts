import * as fs from "fs";
import * as moment from "moment";

import { Data } from "./config";
import * as beautify from "js-beautify";
import { HTMLPlanGenerator } from "./HTMLLogic";
import { Day } from "./model";
import { Restaurant } from "./restaurant";
import * as Download from "./download";
import { PDFPlanReader } from "./parser/pdf-plan-reader";
import { LocalFileLoader } from "./loader/file-loader-local";
import { PDFParser } from "./parser/pdf-parser";

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

    const [bwg, bln, mch] = await Promise.all(
      [Restaurant.BWG, Restaurant.BLN_K, Restaurant.MCH_P].map(r =>
        this.load(r)
      )
    );

    bigPlan = {
      bwg: { plans: bwg },
      bln: { plans: bln },
      mch: { plans: mch }
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
    const weekNr = moment().week();
    const file1 = await Download.load(restaurant, weekNr, lang);
    const file2 = await Download.load(restaurant, weekNr + 1, lang);

    const reader = new PDFPlanReader();
    reader.reads$.subscribe(data => {
      const json = JSON.stringify(data, null, 2);
      fs.writeFileSync(Data.getPath("data.json"), json);
    });
    reader.plans$.subscribe(plan => {
      const json = JSON.stringify(plan, null, 2);
      fs.writeFileSync(Data.getPath("plan.json"), json);
    });

    const parser = new PDFParser();
    const loader = new LocalFileLoader();

    const [data1, data2] = await Promise.all(
      [file1, file2].map(file =>
        loader
          .load(file)
          .then(buffer => parser.parse(buffer))
          .then(page => reader.getTexts(page))
      )
    );

    return [...data1, ...data2];
  }
}

var m = new MainProgram();
m.run();
