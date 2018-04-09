import './style.scss';
import './.htaccess';
import './multiLangPlan.json';

let lang = 'de';
let place = 'bwg';

async function main() {
  const site = new Site('site');

  var headers = new Headers();
  headers.append('pragma', 'no-cache');
  headers.append('cache-control', 'no-cache');
  const response = await fetch('multiLangPlan.json', {
    mode: 'no-cors',
    headers,
    cache: 'no-cache'
  });
  const plan = await response.json();
  const lastModified = response.headers.get('Last-Modified');
  console.log(lastModified);
  console.log('plan loaded.');
  console.log(plan);
  lang = getUrlParam('lang') || localStorage.getItem('lang') || 'de';
  place = getPlaceFromUrl() || 'bwg';
  console.log({ lang, place });
  site.show(plan, {
    planCreationDate: new Date(plan.generationTimestamp || lastModified || '')
  });
}

type Meal = {
  lines: string[];
};
type Day = {
  date: string;
  name: string;
  meals: Meal[];
};
type Plan = { [key: string]: { plans: { [lang: string]: Day[] } } };

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
    });
    return daysContainer;
  }

  public show(plan: Plan, info: { planCreationDate: Date }) {
    localStorage.setItem('lang', lang);

    this.daysContainer.empty();

    const days = plan[place].plans[lang];
    days.forEach((day, index) => {
      const dayDiv = this.createDay(day);
      this.daysContainer.append(dayDiv);
      if (new Date(day.date).getDay() === 5 && index < days.length - 1) {
        this.daysContainer.append('<div class="weekend">');
      }
    });

    const min = shortDate(new Date(days[0].date), lang);
    const max = shortDate(new Date(days[days.length - 1].date), lang);

    const titleElement = $('<span>');
    let headerContent = `Speiseplan ${min} - ${max}`;
    if (lang === 'en') headerContent = `Meal from ${min} to ${max}`;
    titleElement.html(headerContent);

    const deFlag = $('<span class="flag-icon flag-icon-de">');
    const enFlag = $('<span class="flag-icon flag-icon-gb">');

    enFlag.click(() => {
      lang = 'en';
      this.show(plan, info);
    });
    deFlag.click(() => {
      lang = 'de';
      this.show(plan, info);
    });

    const header = $(`#${this.div.attr('id')} > header`);
    header.html('');
    header.append(titleElement);
    header.append(deFlag);
    header.append(enFlag);

    const timestamp = localISODateTime(info.planCreationDate);
    let footerContent = 'generiert: ' + timestamp;
    if (lang === 'en') {
      footerContent = 'generated: ' + timestamp;
    }
    $(`#${this.div.attr('id')} > footer > .content`).html(footerContent);

    this.autoScroll();
  }

  private autoScroll() {
    const day = new Date();
    if (day.getDay() === 6) day.setDate(day.getDate() + 2);
    if (day.getDay() === 0) day.setDate(day.getDate() + 1);
    // if its later than typical lunch time, show next day
    if (day.getHours() >= 13 && day.getMinutes() >= 30) {
      day.setDate(day.getDate() + 1);
    }
    this.scrollToDate(day);
  }

  private scrollToDate(day: Date) {
    const dayStr = day.toISOString().substr(0, 10);
    const currentDayContainer = $('#' + dayStr);
    this.scrollToContainer(currentDayContainer);
  }

  private scrollToContainer(container: JQuery<HTMLElement>) {
    const offset = container.offset();
    const containerOffset = this.daysContainer.offset();
    if (offset && containerOffset) {
      const paddingLeft = parseInt(
        this.daysContainer.css('padding-left').replace('px', '')
      );
      const paddingTop = parseInt(
        this.daysContainer.css('padding-top').replace('px', '')
      );
      const left = offset.left - containerOffset.left - paddingLeft;
      const top = offset.top - containerOffset.top - paddingTop;
      const currentLeft = this.daysContainer.scrollLeft() || 0;
      const currentTop = this.daysContainer.scrollTop() || 0;
      this.daysContainer.scrollLeft(currentLeft + left);
      this.daysContainer.scrollTop(currentTop + top);
    }
  }

  private createDay(day: Day) {
    const dayDiv = $('<div>');
    dayDiv.addClass('day');
    dayDiv.attr('id', day.date);

    const header = $('<header>');

    var dateOpts = {
      weekday: 'long',
      month: '2-digit',
      day: '2-digit'
    };
    const dateStr = new Date(day.date).toLocaleDateString(lang, dateOpts);
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
    const div = $('<div>');
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
    div.html(lines.join('<br />'));
    target.append(div);
  }
}

$(document).ready(main);

function shortDate(date: Date, lang = 'de'): string {
  return date.toLocaleDateString(lang, {
    month: '2-digit',
    day: '2-digit'
  });
}

function isoDate(date: Date): string {
  const de = date.toLocaleDateString('de', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
  return de
    .split('.')
    .reverse()
    .join('-');
}

function localISODateTime(date: Date): string {
  return isoDate(date) + ' ' + date.toLocaleTimeString('de');
}

function getPlaceFromUrl() {
  let place = getUrlParam('place');
  if (!place) {
    const parts = window.location.pathname.split('/');
    if (parts.length > 1) place = parts[1];
  }
  return place;
}

function getUrlParam(param: string) {
  var sPageURL = window.location.search.substring(1);

  var sURLVariables = sPageURL.split('&');

  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] == param) {
      return sParameterName[1];
    }
  }
}
