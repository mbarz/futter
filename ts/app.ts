/// <reference path="../defs/node.d.ts" />
/// <reference path="../defs/underscore.d.ts" />


import _ = require('underscore');
import fs = require('fs');

import model = require('./model');
import Utils = require('./utils');
import Download = require('./download');
import logic = require('./parseLogic');

import * as beautify from 'js-beautify';


console.log("------------------------ futterParser 1.0 ----------------------\n");

class Data {
    public static OUTDIR = "./out/";
    public static HTMLFILENAME = "index.html";
}

class MainProgram {

    public async run() {


        var parser = new logic.PDFPlanParser();

        const file1 = await Download.load();
        const file2 = await Download.load(1);

        const data1 = await parser.parse(file1);
        const data2 = await parser.parse(file2);

        let html = this.generateHtml([...data1, ...data2]);
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


    public generateHtml(data: model.Day[]) {

        console.log("\ngenerating html...");

        var title = "Futterplan";
        const content = data.map(day => this.getDayHtml(day)).join('');
        var html = `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf8" />
            <title>${title}</title>
            <meta name = "viewport" content = "width=device-width, initial-scale=1.0, user-scalable=no">
            <script>
                function scroll() {
                    var today = (new Date()).toISOString().slice(0, 10);
                    window.location.hash = "day" + today;
                }
            </script>
            <link rel="stylesheet" href="style.css" />
        </head>
        <body onload="scroll();">
            <div id="container">
                ${content}
            </div>
            <div id="generationTimestamp">${new Date().toISOString()}</div>
            </body>
        </html>
        `;
        return html;
    }

    private getDayHtml(day: model.Day): string {
        const mealHtmls = day.meals.map(meal => this.getMealHtml(meal));
        return `
        <a name="day${day.date}">
            <div class="day" id="day_${day.date}">
                <div class="header">${day.name} ${day.date}</div>
                ${mealHtmls.join('')}
            </div>
        </a>`;
    }

    private getMealHtml(meal: model.Meal) {

        const lines = meal.describingLines;
        var describingLines  = lines.filter(l => !this.isPrice(l));
        var prices = lines.filter(l => this.isPrice(l));

        describingLines = describingLines.map(l => Utils.convertToHTML(l).trim());
        prices = prices.map(l => Utils.convertToHTML(l).trim());

        return `
        <div class="meal">
            <div style="display: inline">
                <strong>${describingLines.shift()}</strong>
                ${describingLines.map(l => `<br />${l}`).join('\n')}
            </div>
            <div style="display: inline" class="prices">
                ${prices.map(p => `<i class="price">${p}</i>`).join('\n')}
            </div>
        </div>
        `;
    }

    private isPrice(line: string) {
        return (line.match(/[0-9]{1,2}%2C[0-9]{2}/) != null);
    }
}

var m = new MainProgram();
m.run();