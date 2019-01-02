import { Day } from "../model/day";
import { MealContainer } from "./meal-container";

export class DayContainer {
  private constructor(public div: JQuery<HTMLElement>) {}

  static create(day: Day, lang: string) {
    const dayDiv = $("<div>");
    dayDiv.addClass("day");
    dayDiv.attr("id", day.date);

    const header = $("<header>");

    var dateOpts = {
      weekday: "long",
      month: "2-digit",
      day: "2-digit"
    };
    const dateStr = new Date(day.date).toLocaleDateString(lang, dateOpts);

    header.html(dateStr);
    dayDiv.append(header);

    day.meals = day.meals.filter(meal => !!meal);
    for (const meal of day.meals) {
      const mealContainer = MealContainer.create(meal, lang);
      dayDiv.append(mealContainer.div);
    }
    let rowDef = `auto`;
    for (let i = 0; i < day.meals.length; ++i) rowDef += " 1fr";
    dayDiv.css("grid-template-rows", rowDef);
    return new DayContainer(dayDiv);
  }
}
