import { Meal } from "../model/meal";

export class MealContainer {
  private constructor(public div: JQuery<HTMLElement>) {}

  static create(meal: Meal, lang: string) {
    const mealDiv = $("<div>");
    mealDiv.addClass("meal");
    const lines = meal.lines.map(line => {
      return decodeURIComponent(line);
    });

    let tempPrices = [];
    let tempLines = [];
    for (const line of lines) {
      if (line.match(/[0-9]+,[0-9]+/)) {
        this.printLines(mealDiv, tempLines);
        tempLines = [];
        tempPrices.push(line);
      } else {
        this.printPrices(mealDiv, tempPrices);
        tempPrices = [];
        tempLines.push(line);
      }
    }
    this.printLines(mealDiv, tempLines);
    this.printPrices(mealDiv, tempPrices);
    return new MealContainer(mealDiv);
  }

  private static printPrices(target: JQuery<HTMLElement>, prices: string[]) {
    if (prices.length < 1) return;
    const div = $("<div>");
    div.addClass("prices");
    div.append($('<div class="spacer">'));
    for (const price of prices) {
      const priceDiv = $("<div>");
      priceDiv.addClass("price");
      priceDiv.html(price);
      div.append(priceDiv);
    }
    target.append(div);
  }

  private static printLines(target: JQuery<HTMLElement>, lines: string[]) {
    if (lines.length < 1) return;
    const div = $("<div>");
    div.addClass("description");
    lines.splice(0, 1, `<strong>${lines[0]}</strong>`);
    div.html(lines.join("<br />"));
    target.append(div);
  }
}
