async function main() {

    const site = new Site('site');
    const response = await fetch('plan.json');
    const plan = await response.json();
    const lastModified = response.headers.get('Last-Modified');
    console.log(lastModified);
    console.log('plan loaded');
    console.log(plan);
    site.show(plan, { planCreationDate: new Date(lastModified || '') });
}

type Meal = {
    describingLines: string[];
};
type Day = {
    date: string;
    name: string;
    meals: Meal[];
}
type Plan = Day[];

class Site {

    div: JQuery<HTMLElement>;
    daysContainer: JQuery<HTMLElement>;

    constructor(divId: string) {
        this.div = $(`#${divId}`);
        this.daysContainer = this.createDaysContainer();
    }

    private createDaysContainer() {
        const daysContainer = $('#plan');
        (<any>daysContainer).mousewheel((event: Event, delta: number) => {
            const totalHeight = daysContainer.get(0).scrollHeight;
            if (totalHeight < (daysContainer.height() || totalHeight) + 21) {
                const current = daysContainer.scrollLeft() || 0;
                daysContainer.scrollLeft(current - delta * 30);
                event.preventDefault();
            }
        })
        return daysContainer;
    }

    public show(plan: Plan, info: { planCreationDate: Date }) {
        plan.forEach(day => {
            const dayDiv = this.createDay(day);
            this.daysContainer.append(dayDiv);
        });

        const min = new Date(plan[0].date).toLocaleDateString('de');
        const max = new Date(plan[plan.length - 1].date).toLocaleDateString('de');
        const headerContent = `Speiseplan vom ${min} bis zum ${max}`;
        $(`#${this.div.attr('id')} > header`).html(headerContent);
        const footerContent = 'generiert am ' + info.planCreationDate.toLocaleString('de');
        $(`#${this.div.attr('id')} > footer`).html(footerContent);

        let day = (new Date()).toISOString().substr(0, 10);
        day = '2017-10-13';
        const currentDayContainer = $('#' + day);
        const offset = currentDayContainer.offset();
        const containerOffset = this.daysContainer.offset();
        if (offset && containerOffset) {
            const paddingLeft = parseInt(this.daysContainer.css('padding-left').replace('px', ''));
            const paddingTop = parseInt(this.daysContainer.css('padding-top').replace('px', ''));
            const left = offset.left - containerOffset.left - paddingLeft;
            const top = offset.top - containerOffset.top - paddingTop;
            this.daysContainer.scrollLeft(left);
            this.daysContainer.scrollTop(top);
        }

    }

    private createDay(day: Day) {
        const dayDiv = $('<div>');
        dayDiv.addClass('day');
        dayDiv.attr('id', day.date);

        const header = $('<header>');

        var dateOpts = {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        };
        const dateStr = new Date(day.date).toLocaleDateString('de', dateOpts)
        header.html(dateStr);
        dayDiv.append(header);

        for (const meal of day.meals) {
            const mealDiv = this.createMeal(meal);
            dayDiv.append(mealDiv);
        }
        return dayDiv;
    }

    private createMeal(meal: Meal) {
        const mealDiv = $('<div>');
        mealDiv.addClass('meal');
        const lines = meal.describingLines.map(line => {
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
        return mealDiv;
    }

    private printPrices(target: JQuery<HTMLElement>, prices: string[]) {
        if (prices.length < 1) return;
        const div = $('<div>')
        div.addClass('prices');
        div.append($('<div class="spacer">'));
        for (const price of prices) {
            const priceDiv = $('<div>');
            priceDiv.addClass('price');
            priceDiv.html(price);
            div.append(priceDiv);
        }
        target.append(div);
    }

    private printLines(target: JQuery<HTMLElement>, lines: string[]) {
        if (lines.length < 1) return;
        const div = $('<div>');
        div.addClass('description');
        lines.splice(0, 0, `<strong>${lines[0]}</strong>`);
        div.html(lines.join('<br />'))
        target.append(div);
    }
}

$(document).ready(main);