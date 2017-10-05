
import fs = require('fs');
import https = require('https');

import Utils = require('./utils');
import model = require('./model');

var PDFParser = require("pdf2json/pdfparser");

module ParseLogic {

	export class PDFPlanParser {

		constructor() {

		}

		private readyHandler: (data: model.Day[]) => any = null;

		public parse(fileName: string): Promise<model.Day[]> {

			return new Promise((resolve, reject) => {
				this._parse(fileName, (data) => resolve(data));
			});
		}

		private _parse(fileName: string, readyHandler: (data: model.Day[]) => any) {

			this.readyHandler = readyHandler;

			var pdfParser = new PDFParser();

			pdfParser.on("pdfParser_dataReady", (data) => { this.onPFBinDataReady(data) });
			pdfParser.on("pdfParser_dataError", (err) => { this.onPFBinDataError(err) });

			console.log("begin to parse " + fileName);

			fs.readFile(fileName, function(err, pdfBuffer) {
				if (!err) {
					console.log("filesize: " + pdfBuffer.length / 1024.0 + " kB");
					try {
						pdfParser.parseBuffer(pdfBuffer);
					} catch (e) {
						console.error("parseError");
					}
				} else {
					console.error("file error", err);
				}
			});
		}

		private onPFBinDataReady(data) {


			var xStart: number = 1.95;
			var dayWidth: number = 28.36;
			var yStart: number = 10.27;
			var dayHeight: number = 4.687;
            
			console.log("data ready");
			
			var json = JSON.stringify(data.data.Pages[0], null, 2);
			fs.writeFileSync("./out/data.json", json);

			var texts = data.data.Pages[0].Texts;
			var plan: model.Day[] = [];

			console.log(texts.length + " texts found");
			var date = "";
			var firstDayOfDate = 0;
			var monthOfDate = 0;

			for (var key in texts) {
				
				var text = texts[key];
				var x = text.x;
				var y = text.y;
				var r = text.R[0];
				var value = r.T;
				
				if (x >= 77 && x <= 100 && y >= 6.8 && y <= 7) {
					
					date = Utils.convertToHTML(value);
					console.log("date found: " + date);
					var match = date.match(/([0-9]{2}).([0-9]{2}).[0-9]{4} bis/);
					
					firstDayOfDate = parseInt(match[1]);
					monthOfDate = parseInt(match[2]);
					console.log("first: " + firstDayOfDate);
					console.log("month: " + monthOfDate);
				}
			}
			
			for (var key in texts) {
				
				var text = texts[key];
				var x = text.x;
				var y = text.y;
				var r = text.R[0];
				var value = r.T;

				var dayIndex = Math.floor((Math.ceil(x) - xStart) / dayWidth);
				var mealIndex = Math.floor((y - yStart) / dayHeight);

				

				if (mealIndex >= 0 && mealIndex < 5 && dayIndex >= 0 && dayIndex < 5) {

					if (!plan[dayIndex]) {
						var daysDate = new Date((new Date()).getFullYear(), monthOfDate - 1, firstDayOfDate + dayIndex + 1);
						plan[dayIndex] = {
							meals: [],
							name: Utils.getDayName(dayIndex),
							date: daysDate.toISOString().slice(0, 10)
						};
					}

					var day = plan[dayIndex];

					if (!day.meals[mealIndex]) {
						day.meals[mealIndex] = { describingLines: [] };
					}

					var meal = day.meals[mealIndex];

					meal.describingLines.push(value);
				}

			}
			

			if (this.readyHandler != null) {
				console.log("delivering parsed data to listener");
				
				var json = JSON.stringify(plan, null, 2);
				fs.writeFileSync("./out/plan.json", json);
				this.readyHandler(plan);
			}
		}

		private onPFBinDataError(error) {
			console.error("an error occured");
			console.error(error);
		}
	}
}

export = ParseLogic;