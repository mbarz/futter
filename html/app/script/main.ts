let lang = 'de';
let place = 'bwg'

async function main() {

    const site = new Site('site');
    const response = await fetch('multiLangPlan.json');
    const plan = await response.json();
    const lastModified = response.headers.get('Last-Modified');
    console.log(lastModified);
    console.log('plan loaded');
    console.log(plan);
    lang = getUrlParam('lang') || 'de';
    place = getUrlParam('place') || 'bwg';
    console.log({lang, place});
    site.show(plan, { planCreationDate: new Date(lastModified || '') });
}

type Meal = {
    lines: string[];
};
type Day = {
    date: string;
    name: string;
    meals: Meal[];
}
type Plan = { [key: string]: { plans: { [lang: string]: Day[] } } }

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
        const days = plan[place].plans[lang];
        days.forEach(day => {
            const dayDiv = this.createDay(day);
            this.daysContainer.append(dayDiv);
        });

        const min = new Date(days[0].date).toLocaleDateString(lang);
        const max = new Date(days[days.length - 1].date).toLocaleDateString(lang);
        let headerContent = `Speiseplan vom ${min} bis zum ${max}`;
        if (lang === 'en') headerContent = `Meal from ${min} to ${max}`;
        $(`#${this.div.attr('id')} > header`).html(headerContent);
        let footerContent = 'generiert am ' + info.planCreationDate.toLocaleString(lang);
        if (lang === 'en') {
            footerContent = 'generated on ' + info.planCreationDate.toLocaleString(lang);
        }
        $(`#${this.div.attr('id')} > footer`).html(footerContent);

        const day = (new Date()).toISOString().substr(0, 10);
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
        const dateStr = new Date(day.date).toLocaleDateString(lang, dateOpts)
        header.html(dateStr);
        dayDiv.append(header);

        for (const meal of day.meals) {
            const mealDiv = this.createMeal(meal);
            dayDiv.append(mealDiv);
        }
        let rowDef = `auto`;
        for (let i = 0; i < day.meals.length; ++i) rowDef += ' 1fr';
        dayDiv.css('grid-template-rows', rowDef);
        return dayDiv;
    }

    private createMeal(meal: Meal) {
        const mealDiv = $('<div>');
        mealDiv.addClass('meal');
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
        lines.splice(0, 1, `<strong>${lines[0]}</strong>`);
        div.html(lines.join('<br />'))
        target.append(div);
    }
}

$(document).ready(main);

function getUrlParam(param: string) {
    var sPageURL = window.location.search.substring(1);

    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] == param) {
            return sParameterName[1];
        }
    }
}​
