import * as fs from 'fs';
import * as beautify from 'js-beautify';
import { HTMLPlanGenerator } from './HTMLLogic';
import { PDFPlanParser } from './parseLogic';
import Download = require('./download');

console.log("------------------------ futterParser 1.0 ----------------------\n");

class Data {
    public static OUTDIR = "./out/";
    public static HTMLFILENAME = "index.html";
}

class MainProgram {

    public async run() {


        var parser = new PDFPlanParser();

        const file1 = await Download.load();
        const file2 = await Download.load(1);

        const data1 = await parser.parseFile(file1);
        const data2 = await parser.parseFile(file2);

        const gen = new HTMLPlanGenerator();
        let html = gen.generate([...data1, ...data2]);
        html = html.replace(/\n\s+/g, '\n'); // remove all current indention
        html = beautify.html_beautify(html);

        console.log("done");
        console.log("\nwriting to file...");

        var file = fs.createWriteStream(Data.OUTDIR + Data.HTMLFILENAME);
        file.write(html);
        file.end();

        console.log("done");
        console.log("\neverything's done. You can use the " + Data.OUTDIR + Data.HTMLFILENAME + " now");
    }
}

var m = new MainProgram();
m.run();