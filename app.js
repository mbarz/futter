/// <reference path="defs/node.d.ts" />
/// <reference path="defs/underscore.d.ts" />
var https = require('https');

var fs = require('fs');

console.log("bam");

var dayNames = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

var nodeUtil = require("util"), PDFParser = require("pdf2json/pdfparser");

var pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataReady", _onPFBinDataReady);

pdfParser.on("pdfParser_dataError", _onPFBinDataError);

var _pdfPathBase = "res/";
var folderName = "speiseplaene";
var pdfId = "2014025107de";

var date = "";
var firstDayOfDate = 0;
var monthOfDate = 0;

var plan = [];

loadFromServer();

//read();
process.stdin.resume();

function read() {
    fs.readFile("plan.pdf", function (err, pdfBuffer) {
        if (!err) {
            console.log("parsing: " + pdfBuffer.length);
            var data = pdfParser.parseBuffer(pdfBuffer);
        }
    });
}

function loadFromServer() {
    var file = fs.createWriteStream("plan.pdf");

    //https://gpartner.erlm.siemens.de/sp-tool/dl/2014028107de.pdf
    //https://gpartner.erlm.siemens.de/sp-tool/dl/2014027107de.pdf
    var request = https.get("https://gpartner.erlm.siemens.de/sp-tool/dl/2014041107de.pdf", function (res) {
        res.on('end', function (data) {
            file.end();

            read();

            console.log("END!");
        });

        res.on('data', function (data) {
            file.write(data);
        });
    });
}

function _onPFBinDataReady(data) {
    console.log("go!");
    handleTexts(data.data.Pages[0].Texts);

    fs.writeFile("out.json", JSON.stringify(data.data, null, 4), function () {
    });
}

function _onPFBinDataError() {
}

function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += c;
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += ((c & 0x1F) << 6) | (char2 & 0x3F);
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += ((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0);
                break;
        }
    }

    return "&#" + out + ";";
}

function convertToHTML(text) {
    var ret = "";

    while (text.search("%") >= 0) {
        var startIndex = text.search("%");
        ret += text.substring(0, startIndex);
        var endIndex = startIndex + 3;

        while (text[endIndex] == '%')
            endIndex += 3;

        //console.log("sub: " + text.substring(startIndex, endIndex));
        var numbers = text.substring(startIndex, endIndex);
        var splitted = numbers.split("%");
        var array = new Uint8Array(splitted.length);
        var outarray = [];
        for (var i = 1; i < splitted.length; ++i) {
            array[i] = parseInt("0x" + splitted[i]);
            outarray.push(array[i]);
        }

        //console.log(outarray.join());
        ret += Utf8ArrayToStr(array);

        //ret += Utf8ArrayToStr(array);
        text = text.substring(endIndex);
    }
    ret += text;
    ret = ret.replace("&#0836432;", "&euro; ").replace("&#04432;", ", ").replace("&#0323832;", " & ").replace("&#03234;", " \"");
    return ret;
}

function handleTexts(texts) {
    console.log(texts.length + " texts");

    for (var key in texts) {
        var text = texts[key];
        var x = text.x;
        var y = text.y;
        var r = text.R[0];
        var value = r.T;

        var dayIndex = Math.floor((Math.ceil(x) - 3.875) / 27.5);
        var mealIndex = Math.floor((y - 8.3) / 3.5);

        if (x >= 19.3 && x <= 19.4 && y >= 2.2 && y <= 2.3) {
            date = convertToHTML(value);
            var match = date.match(/vom&#032;([0-9]{2}).([0-9]{2})./);
            firstDayOfDate = parseInt(match[1]);
            monthOfDate = parseInt(match[2]);
        }

        if (mealIndex >= 0 && mealIndex < 4 && dayIndex >= 0 && dayIndex < 5) {
            //console.log(day + "\t" + index + "\t" + convertToHTML(value));
            if (!plan[dayIndex]) {
                plan[dayIndex] = { meals: [], name: dayNames[dayIndex] };
            }

            var day = plan[dayIndex];

            if (!day.meals[mealIndex]) {
                day.meals[mealIndex] = { describingLines: [] };
            }

            var meal = day.meals[mealIndex];

            meal.describingLines.push(value);
        }
        //console.log(x + ", " + y + " : " + value);
    }

    //printPlan();
    generateHTML();
}

function printPlan() {
    for (var key in plan) {
        console.log("---------------------------");

        var day = plan[key];

        for (var mealKey in day.meals) {
            var meal = day.meals[mealKey];

            for (var lineNumber in meal.describingLines) {
                var line = meal.describingLines[lineNumber];
                console.log(line);
            }

            console.log("\n");
        }

        console.log("\n");
    }
}

function generateHTML() {
    console.log("generating html...");

    var html = '<!doctype html>\n<html>\n<head>\n';

    html += '\t<title>' + date + '</title>';
    html += '\t<meta name = "viewport" content = "width=device-width, initial-scale=1.0, user-scalable=no">\n';
    html += '<script>function scroll() {console.log("test");var today = (new Date()).getDay() - 1;window.location.hash = "day" + today;}</script>';
    html += '\t<link rel="stylesheet" href="style.css" />\n</head>\n<body onload="scroll();">\n';

    for (var key in plan) {
        //console.log(plan[key].name);
        html += '\t<a name="day' + key + '"><div class="day" id="day_' + key + '">\n';

        var day = plan[key];

        html += '\t\t<div class="header">' + day.name + ' ' + ("00" + (firstDayOfDate + parseInt(key))).slice(-2) + '.' + ("00" + (monthOfDate)).slice(-2) + '.</div>';

        for (var mealKey in day.meals) {
            html += '\t\t<div class="meal" id="meyl_' + key + '_' + mealKey + '">\n';

            var meal = day.meals[mealKey];

            for (var lineNumber in meal.describingLines) {
                var line = meal.describingLines[lineNumber];
                html += "\t\t\t";

                if (lineNumber == 0)
                    html += "<h2>";

                html += convertToHTML(line);

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
    html += "</body>\n</html>";

    console.log("done");
    console.log("writing to file...");

    var file = fs.createWriteStream("plan.html");
    file.write(html);
    file.end();

    console.log("done");
    //console.log(html);
}
