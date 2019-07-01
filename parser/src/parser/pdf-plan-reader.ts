import * as moment from "moment";
import { Subject } from "rxjs";

import * as Utils from "../utils";
import { Day } from "../model";

import { PDFParserResult, Text } from "./pdf-parser";

export const XSTART = 1.95;
export const YSTART = 10.27;
export const DAY_WIDTH = 28.36;
export const DAY_HEIGHT = 4.687;

export const DATE_X_MIN = 77;
export const DATE_X_MAX = 100;
export const DATE_Y_MIN = 6.8;
export const DATE_Y_MAX = 7;

export class PDFPlanReader {
  reads$ = new Subject<PDFParserResult>();
  plans$ = new Subject<Day[]>();

  constructor() {}

  public getTexts(page: PDFParserResult): Day[] {
    this.reads$.next(page);
    this.plans$;

    const texts = page.texts;
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

    this.plans$.next(plan);
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

  private tryToGetStartDateFromHeader(texts: Text[]): Date | undefined {
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
        const dateStr = Utils.convertToHTML(value).trim();

        var match = dateStr.match(/([0-9]{2}).([0-9]{2}).([0-9]{4})/);
        const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : dateStr;
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
