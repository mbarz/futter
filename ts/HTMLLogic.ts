import { Day, Meal } from './model';
import * as Utils from './utils';

module HTMLLogic {
    export class HTMLPlanGenerator {

        generate(plan: Day[]) {

            console.log("\ngenerating html...");
            return `
            <!doctype html>
            <html>
                ${this.generateHead('Futterplan')}
                ${this.generateBody(plan)}
            < /html>`;
        }

        private generateHead(title: string) {
            return `
            <head>
                <meta charset="utf8" />
                <title>${title}</title>
                <meta name = "viewport" content = "width=device-width, initial-scale=1.0, user-scalable=no">
                <script>
                    function scroll() {
                        var today = (new Date()).toISOString().slice(0, 10);
                        window.location.hash = "day" + today;
                    }
                </script>
                <link rel="stylesheet" href="style.css" />
            </head>`;
        }

        private generateBody(plan: Day[]) {

            const dayGen = new HTMLDayGenerator();
            const content = plan.map(day => dayGen.generate(day)).join('');
            return `
            <body onload="scroll();" >
                <div id="container" >
                    ${content}
                </div>
                <div id="generationTimestamp">
                    ${new Date().toISOString()}
                </div>
            </body>`
        }
    }

    class HTMLDayGenerator {

        generate(day: Day) {
            const mealGen = new HTMLMealGenerator();
            const mealHtmls = day.getMeals().map(meal => mealGen.generate(meal));
            return `
            <a name="day${day.date}">
                <div class="day" id="day_${day.date}">
                    <div class="header">${day.name} ${day.date}</div>
                    ${mealHtmls.join('')}
                </div>
            </a>`;
        }
    }

    class HTMLMealGenerator {
        generate(meal: Meal) {
            return `
            <div class="meal">
                <div style="display: inline">
                    ${this.generateDescribingLines(meal)}
                </div>
                <div style="display: inline" class="prices">
                    ${this.generatePricesLine(meal)}
                </div>
            </div>`;
        }

        private generateDescribingLines(meal: Meal) {

            const lines = meal.getDescribingLines();
            return `
            <strong>${lines.shift()}</strong>
            ${lines.map(l => `<br />${l}`).join('\n')}`;
        }

        private generatePricesLine(meal: Meal) {
            return meal.getPrices()
                .map(p => this.generatePrice(p))
                .join('\n')
        }

        private generatePrice(price: string) {
            return `<i class="price">${price}</i>`;
        }
    }
}

export = HTMLLogic;