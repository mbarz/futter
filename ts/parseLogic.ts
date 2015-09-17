
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

		public parse(fileName: string, readyHandler: (data: model.Day[]) => any) {

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


			console.log("data ready");

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

				var dayIndex = Math.floor((Math.ceil(x) - 3.875) / 27.5);
				var mealIndex = Math.floor((y - 8.3) / 3.5);

				if (x >= 19.3 && x <= 19.4 && y >= 2.2 && y <= 2.3) {
					date = Utils.convertToHTML(value);
					var match = date.match(/vom&#032;([0-9]{2}).([0-9]{2})./);
					firstDayOfDate = parseInt(match[1]);
					monthOfDate = parseInt(match[2]);
				}

				if (mealIndex >= 0 && mealIndex < 4 && dayIndex >= 0 && dayIndex < 5) {

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