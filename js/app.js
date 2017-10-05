"use strict";
/// <reference path="../defs/node.d.ts" />
/// <reference path="../defs/underscore.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Utils = require("./utils");
var Download = require("./download");
var logic = require("./parseLogic");
var beautify = require("js-beautify");
console.log("------------------------ futterParser 1.0 ----------------------\n");
var Data = (function () {
    function Data() {
    }
    Data.OUTDIR = "./out/";
    Data.HTMLFILENAME = "index.html";
    return Data;
}());
var MainProgram = (function () {
    function MainProgram() {
    }
    MainProgram.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parser, file1, file2, data1, data2, html, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parser = new logic.PDFPlanParser();
                        return [4 /*yield*/, Download.load()];
                    case 1:
                        file1 = _a.sent();
                        return [4 /*yield*/, Download.load(1)];
                    case 2:
                        file2 = _a.sent();
                        return [4 /*yield*/, parser.parse(file1)];
                    case 3:
                        data1 = _a.sent();
                        return [4 /*yield*/, parser.parse(file2)];
                    case 4:
                        data2 = _a.sent();
                        html = this.generateHtml(data1.concat(data2));
                        html = html.replace(/\n\s+/g, '\n'); // remove all current indention
                        html = beautify.html_beautify(html);
                        console.log("done");
                        console.log("\nwriting to file...");
                        file = fs.createWriteStream(Data.OUTDIR + Data.HTMLFILENAME);
                        file.write(html);
                        file.end();
                        console.log("done");
                        console.log("\neverything's done. You can use the " + Data.OUTDIR + Data.HTMLFILENAME + " now");
                        return [2 /*return*/];
                }
            });
        });
    };
    MainProgram.prototype.generateHtml = function (data) {
        var _this = this;
        console.log("\ngenerating html...");
        var title = "Futterplan";
        var content = data.map(function (day) { return _this.getDayHtml(day); }).join('');
        var html = "\n        <!doctype html>\n        <html>\n        <head>\n            <meta charset=\"utf8\" />\n            <title>" + title + "</title>\n            <meta name = \"viewport\" content = \"width=device-width, initial-scale=1.0, user-scalable=no\">\n            <script>\n                function scroll() {\n                    var today = (new Date()).toISOString().slice(0, 10);\n                    window.location.hash = \"day\" + today;\n                }\n            </script>\n            <link rel=\"stylesheet\" href=\"style.css\" />\n        </head>\n        <body onload=\"scroll();\">\n            <div id=\"container\">\n                " + content + "\n            </div>\n            <div id=\"generationTimestamp\">" + new Date().toISOString() + "</div>\n            </body>\n        </html>\n        ";
        return html;
    };
    MainProgram.prototype.getDayHtml = function (day) {
        var _this = this;
        var mealHtmls = day.meals.map(function (meal) { return _this.getMealHtml(meal); });
        return "\n        <a name=\"day" + day.date + "\">\n            <div class=\"day\" id=\"day_" + day.date + "\">\n                <div class=\"header\">" + day.name + " " + day.date + "</div>\n                " + mealHtmls.join('') + "\n            </div>\n        </a>";
    };
    MainProgram.prototype.getMealHtml = function (meal) {
        var _this = this;
        var lines = meal.describingLines;
        var describingLines = lines.filter(function (l) { return !_this.isPrice(l); });
        var prices = lines.filter(function (l) { return _this.isPrice(l); });
        describingLines = describingLines.map(function (l) { return Utils.convertToHTML(l).trim(); });
        prices = prices.map(function (l) { return Utils.convertToHTML(l).trim(); });
        return "\n        <div class=\"meal\">\n            <div style=\"display: inline\">\n                <strong>" + describingLines.shift() + "</strong>\n                " + describingLines.map(function (l) { return "<br />" + l; }).join('\n') + "\n            </div>\n            <div style=\"display: inline\" class=\"prices\">\n                " + prices.map(function (p) { return "<i class=\"price\">" + p + "</i>"; }).join('\n') + "\n            </div>\n        </div>\n        ";
    };
    MainProgram.prototype.isPrice = function (line) {
        return (line.match(/[0-9]{1,2}%2C[0-9]{2}/) != null);
    };
    return MainProgram;
}());
var m = new MainProgram();
m.run();
