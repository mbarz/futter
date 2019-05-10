module model {
  export class Meal {
    constructor(private lines: string[] = []) {}

    public addLine(line: string) {
      this.lines.push(line);
    }

    public getDescribingLines() {
      return this.lines.filter(l => !this.isPriceLine(l));
    }

    public getPrices() {
      return this.lines.filter(l => this.isPriceLine(l));
    }

    private isPriceLine(line: string) {
      return line.match(/[0-9]{1,2}%2C[0-9]{2}/) != null;
    }
  }

  export class Day {
    private meals: Meal[] = [];

    constructor(public date: string, public name: string) {}

    public getMeals(): Meal[] {
      return [...this.meals];
    }

    getOrCreateMeal(index: number) {
      if (!this.meals[index]) {
        this.meals[index] = new Meal();
      }
      return this.meals[index];
    }
  }
}

export = model;
