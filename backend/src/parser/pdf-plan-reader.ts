import * as fs from "fs";

import * as moment from "moment";

import * as Utils from "../utils";
import { Day } from "../model";
import { Data } from "../config";

import { PDFText, PDFData } from "./model";
import {
  XSTART,
  DAY_WIDTH,
  DAY_HEIGHT,
  YSTART,
  DATE_X_MIN,
  DATE_X_MAX,
  DATE_Y_MIN,
  DATE_Y_MAX
} from "./pdf-plan-constants";

export class PDFPlanReader {
  constructor(private pdfData: PDFData) {}

  public getTexts(): Day[] {
    const pages = this.pdfData.Pages;
    const page = pages[0];

    let json = JSON.stringify(page, null, 2);
    fs.writeFileSync(Data.getPath("data.json"), json);

    const texts = page.Texts;
    const plan: Day[] = [];

    console.log(texts.length + " texts found");
    let date = this.tryToGetStartDateFromHeader(texts);
    if (!date) {
      // if there is no date found, take monday of current week
      date = new Date();
      const day = date.getDay();
      date.setDate(date.getDate() - (day - 1));
    }

    for (var key in texts) {
      const text = texts[key];
      const x = text.x;
      const y = text.y;
      const r = text.R[0];
      const value = r.T;

      const dayIndex = this.getDayIndexForX(x);
      const mealIndex = this.getMealIndexForY(y);

      if (this.areIndexesValid({ mealIndex, dayIndex })) {
        if (!plan[dayIndex]) {
          const daysDate = new Date(date);
          daysDate.setDate(daysDate.getDate() + dayIndex);
          const name = Utils.getDayName(dayIndex);
          const dateStr = moment(daysDate).format("YYYY-MM-DD");
          console.log(`writing to ${dateStr}`);
          plan[dayIndex] = new Day(dateStr, name);
        }
        var day = plan[dayIndex];

        const meal = day.getOrCreateMeal(mealIndex);
        const line = decodeURIComponent(value);
        meal.addLine(line);
      }
    }

    console.log("delivering parsed data to listener");

    json = JSON.stringify(plan, null, 2);
    fs.writeFileSync(Data.getPath("plan.json"), json);
    return plan;
  }

  private areIndexesValid({
    mealIndex,
    dayIndex
  }: {
    mealIndex: number;
    dayIndex: number;
  }): boolean {
    return mealIndex >= 0 && mealIndex < 5 && dayIndex >= 0 && dayIndex < 5;
  }

  private getMealIndexForY(y: number) {
    return Math.floor((y - YSTART) / DAY_HEIGHT);
  }

  private getDayIndexForX(x: number) {
    return Math.floor((Math.ceil(x) - XSTART) / DAY_WIDTH);
  }

  private tryToGetStartDateFromHeader(texts: PDFText[]): Date | undefined {
    for (let key in texts) {
      const text = texts[key];
      const x = text.x;
      const y = text.y;
      const r = text.R[0];
      const value = r.T;
      if (
        x >= DATE_X_MIN &&
        x <= DATE_X_MAX &&
        y >= DATE_Y_MIN &&
        y <= DATE_Y_MAX
      ) {
        const dateStr = Utils.convertToHTML(value);

        var match = dateStr.match(/([0-9]{2}).([0-9]{2}).([0-9]{4}) /);
        const iso = `${match[3]}-${match[2]}-${match[1]}`;
        const date = new Date(iso);
        console.log(
          `date found in "${dateStr}" => ${iso} => ${date.toDateString()}`
        );
        return date;
      }
    }
    return undefined;
  }
}
