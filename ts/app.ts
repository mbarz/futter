/// <reference path="../defs/node.d.ts" />
/// <reference path="../defs/underscore.d.ts" />


import _ = require('underscore');
import fs = require('fs');

import model = require('./model');
import Utils = require('./utils');
import Download = require('./download');
import logic = require('./parseLogic');


console.log("------------------------ futterParser ----------------------\n");

class Data {
    public static OUTDIR = "./out/";
    public static HTMLFILENAME = "plan.html";
}

class MainProgram {

    private request1Done = false;
    private request2Done = false;

    public run() {

        var weeks = [];
        var parser = new logic.PDFPlanParser();

        Download.loadThisWeekAndSaveAsPdf((thisWeeksPdfFileName) => {

            parser.parse(thisWeeksPdfFileName, (data1) => {

                this.request1Done = true;
                weeks.push(data1);
                // this.workWithDataIfReady(weeks);
                
                Download.loadNextWeekAndSaveAsPdf((nextWeeksPdfFileName) => {
        
                    parser.parse(nextWeeksPdfFileName, (data2) => {
        
                        this.request2Done = true;
                        weeks.push(data2);       
                        this.workWithDataIfReady(weeks);
                    });
                });       
                
            });
        });
        
         
        
    }


    private workWithDataIfReady(weeks: model.Day[][]) {

        if (this.request1Done && this.request2Done) {
            this.generateHtml(weeks);
        } else {
            console.log("waiting...");
        }
    }

    public generateHtml(data: model.Day[][]) {

        console.log("\ngenerating html...");

        var html = '<!doctype html>\n<html>\n<head>\n';

        var date = "Futterplan";
        html += '\t<title>' + date + '</title>';
        html += '\t<meta name = "viewport" content = "width=device-width, initial-scale=1.0, user-scalable=no">\n';
        html += '<script>function scroll() {console.log("test");var today = (new Date()).toISOString().slice(0, 10);window.location.hash = "day" + today;}</script>';
        html += '\t<link rel="stylesheet" href="style.css" />\n</head>\n<body onload="scroll();">\n';
        html += '<div id="container">\n'

        data.forEach((week) => {
            for (var key in week) {

                var day = week[key];

                html += '\t<a name="day' + day.date + '"><div class="day" id="day_' + day.date + '">\n';

                html += '\t\t<div class="header">' + day.name + ' ' + day.date + '</div>';


                for (var mealKey in day.meals) {


                    html += '\t\t<div class="meal" id="meyl_' + key + '_' + mealKey + '">\n';

                    var meal = day.meals[mealKey];

                    for (var lineNumber in meal.describingLines) {
                        var line = meal.describingLines[lineNumber];
                        html += "\t\t\t";

                        if (lineNumber == 0) html += "<h2>";

                        html += Utils.convertToHTML(line);

                        if (lineNumber == 0) {
                            html += "</h2>";
                        } else {
                            html += "<br />\n";
                        }
                    }

                    html += "\t\t</div>\n";
                }

                html += "\t</div></a>\n";
            }
        });

        html += "</div>\n</body>\n</html>";

        console.log("done");
        console.log("\nwriting to file...");

        var file = fs.createWriteStream(Data.OUTDIR + Data.HTMLFILENAME);
        file.write(html);
        file.end();

        console.log("done");

        console.log("\neverything's done. You can use the plan.html now");
    }
}









var m = new MainProgram();
m.run();