import "./style.scss";
import "./.htaccess";
import "./multiLangPlan.json";

let lang = "de";
let place = "bwg";

async function main() {
  const site = new Site("site");

  var headers = new Headers();
  headers.append("pragma", "no-cache");
  headers.append("cache-control", "no-cache");
  const response = await fetch("multiLangPlan.json", {
    mode: "no-cors",
    headers,
    cache: "no-cache"
  });
  const plan = await response.json();
  const lastModified = response.headers.get("Last-Modified") || "unknown";
  lang = getUrlParam("lang") || localStorage.getItem("lang") || "de";
  place = getPlaceFromUrl() || "bwg";
  site.show(plan, {
    planCreationDate: new Date(plan.generationTimestamp || lastModified || "")
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
  plan: Plan | undefined;
  info: { planCreationDate: Date } | undefined;

  constructor(divId: string) {
    this.div = $(`#${divId}`);
    this.daysContainer = this.createDaysContainer();
  }

  private createDaysContainer() {
    const daysContainer = $("#plan");
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

  public update() {
    if (this.plan && this.info) this.show(this.plan, this.info);
  }

  public show(plan: Plan, info: { planCreationDate: Date }) {
    this.plan = plan;
    this.info = info;
    localStorage.setItem("lang", lang);

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

    const overlay = this.createOverlay();
    $(document).keyup(e => {
      if (e.keyCode === 27) overlay.hide();
    });
    let menu = this.createMenu();

    const menuElement = $(`<div class="menu-button">`);
    const menuIcon = $('<i id="menu-button">');
    menuIcon.addClass("fa fa-bars");
    menuElement.append(menuIcon);
    menuElement.click(() => menu.toggle());

    const titleElement = $("<span>");
    let headerContent = `Speiseplan ${min} - ${max}`;
    if (lang === "en") headerContent = `Meal from ${min} to ${max}`;
    titleElement.html(headerContent);

    const header = $(`#${this.div.attr("id")} > header`);
    header.html("");
    header.append(menuElement);
    header.append(titleElement);

    const timestamp = localISODateTime(info.planCreationDate);
    let footerContent = "generiert: " + timestamp;
    if (lang === "en") {
      footerContent = "generated: " + timestamp;
    }
    $(`#${this.div.attr("id")} > footer > .content`).html(footerContent);

    this.autoScroll();
  }

  private autoScroll() {
    const day = new Date();
    if (day.getHours() * 100 + day.getMinutes() >= 1330) {
      day.setDate(day.getDate() + 1);
    }
    if (day.getDay() === 6) day.setDate(day.getDate() + 2);
    if (day.getDay() === 0) day.setDate(day.getDate() + 1);
    // if its later than typical lunch time, show next day
    this.scrollToDate(day);
  }

  private scrollToDate(day: Date) {
    const dayStr = day.toISOString().substr(0, 10);
    const currentDayContainer = $("#" + dayStr);
    this.scrollToContainer(currentDayContainer);
  }

  private scrollToContainer(container: JQuery<HTMLElement>) {
    const offset = container.offset();
    const containerOffset = this.daysContainer.offset();
    if (offset && containerOffset) {
      const paddingLeft = parseInt(
        this.daysContainer.css("padding-left").replace("px", "")
      );
      const paddingTop = parseInt(
        this.daysContainer.css("padding-top").replace("px", "")
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

    for (const meal of day.meals) {
      const mealDiv = this.createMeal(meal);
      dayDiv.append(mealDiv);
    }
    let rowDef = `auto`;
    for (let i = 0; i < day.meals.length; ++i) rowDef += " 1fr";
    dayDiv.css("grid-template-rows", rowDef);
    return dayDiv;
  }

  private createMeal(meal: Meal) {
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
    return mealDiv;
  }

  private printPrices(target: JQuery<HTMLElement>, prices: string[]) {
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

  private printLines(target: JQuery<HTMLElement>, lines: string[]) {
    if (lines.length < 1) return;
    const div = $("<div>");
    div.addClass("description");
    lines.splice(0, 1, `<strong>${lines[0]}</strong>`);
    div.html(lines.join("<br />"));
    target.append(div);
  }

  createOverlay() {
    let overlay = $("#overlay");
    if (overlay.length < 1) overlay = $('<div id="overlay"></div>');
    overlay.html("");
    const overlayText = $('<div id="overlay-text"></div>');
    overlayText.text("123");
    overlay.append(overlayText);
    const closeBtn = $("<button>Ok</button>");
    closeBtn.click(() => overlay.hide());
    overlay.append(closeBtn);
    $("body").append(overlay);
    return overlay;
  }

  showInfo() {
    const info = `
    <h1>futter@siemens</h1>
    <h2>Allgemeine Informationen</h2>
    <p>
    Bei Siemens werden die Speisepläne der Kantinen im Internet per PDF zur Verfügung gestellt.
    Die Links sind jedoch teilweise schwer zu finden bzw. das endgültige PDF ist durch komplizierte URLs nur über mehrere Klicks zu erreichen.
    Um mir und anderen die Ansicht des Speiseplans zu erleichtern, habe ich einen Parser geschrieben, der sich in bestimmten Zeitabständen die PDF-Dateien holt und diese in JSON umwandelt. Diese JSON-Dateien werden dann mit Hilfe von HTML und CSS hier angezeigt. Dabei verändert sich die Ansicht je nachdem, ob ein Smartphone oder ein Desktop-PC zur Ansicht verwendet wird.
    </p>
    <h2>Finanzierung</h2>
    <p>
    Das Projekt entsteht in Heimarbeit als Hobby. Dennoch fallen Kosten in Form von Serverkosten an.
    Das Projekt wird gehostet bei uberspace.de, wodurch der Preis für das Hosting beginnend bei 1€ im Monat selbst gewählt werden kann.
    Es fallen also für dieses Projekt <b>mindestens</b> 1€ im Monat an laufenden Kosten an. Genauer sind die Kosten nicht zu benennen, da ich auf meinem uberspace auch noch weitere Projekte laufen lasse.
    </p>
    <h2>Unterstützung</h2>
    <p>Das Projekt kann entweder über Mitarbeit oder Anregungen über github oder durch Spenden unterstützt werden.</p>
    <a href="https://github.com/mbarz/futter">github Projekt</a><br />
    <a id="paypal-link" href="https://paypal.me/muxe/1">Spenden für Hosting</a>
    <div class="info-sec">
    <h1>Datenschutzerklärung</h1>
    <h2>Persönliche Daten</h2>
    <p>
    So weit wie möglich verzichtet diese Seite auf die Erhebung persönlicher Daten. Die einzigen Daten die erhoben werden, ergeben sich durch die Seitenaufrufe per http.
    </p>
    <p>
    Diese Daten werden nicht bewusst an Dritte weitergegeben.
    </p>

    <h2>Hosting</h2>
    <p>
    Diese Seite wird durch einen externen Anbieter gehosted. Dieser schreibt Logfiles, auf die ich wenig Einfluss habe. Durch diese Logfiles werden Daten wie IP-Adressen, Zugriffszeiten, Browsertyp etc. automatisch erfasst und auch gespeichert.
    </p>
    <h2>Externe Dienste</h2>
    <p>
    Einige Funktionen dieser Seite wurden mit externen Diensten implementiert. Somit werden automatisch beim Besuch dieser Seite auch verschiedene andere Seiten aufgerufen, die somit Statistikdaten erheben können.
    </p>
    <p>
    Das sind Stand Mai 2018:
    <ul>
      <li>cdn.polyfill.io</li>
      <li>code.jquery.com</li>
      <li>cdnjs.cloudflare.com</li>
      <li>maxcdn.bootstrapcdn.com</li>
    </ul>
    </p>
    <p>
    Des weiteren kann mit Hilfe des Paypal-Links auf dieser Seite Geld gespendet werden. Beim Verwenden dieses Links wird diese Seite verlassen und es gelten die Datenschutzbedingungen von Paypal.
    </p>
    <h2>Kontakt</h2>
    <p>
    Bei weiteren Fragen stehe ich unter der folgenden Email zur Verfügung:
    </p>
    <p>
    futter@muxe.de
    </p>
    </div>
    `;

    console.log($("#overlay").css("display"));
    $("#overlay").css("display", "flex");
    $("#overlay-text").html(info);
  }

  createMenu() {
    let menu = $("#menu");
    if (menu.length < 1) menu = $('<div id="menu"></div>');
    menu.html("");

    const links = $("<ul></ul>");

    createMenuLink("fa fa-info", "Info", () => {
      this.showInfo();
    });
    createMenuLink("flag-icon flag-icon-de", "deutsch", () => {
      lang = "de";
      this.update();
    });
    createMenuLink("flag-icon flag-icon-gb", "englisch", () => {
      lang = "en";
      this.update();
    });

    menu.append(links);

    $("body").append(menu);
    return menu;

    function createMenuLink(icon: string, label: string, action: Function) {
      const infoLink = $(`
      <li>
        <span class="menu-item-icon"><i class="${icon}"></i></span>
        <span class="menu-item-label">${label}</span>
      </li>
      `);
      infoLink.click(() => {
        menu.hide();
        action();
      });
      links.append(infoLink);
      return infoLink;
    }
  }
}

$(document).ready(main);

function shortDate(date: Date, lang = "de"): string {
  return date.toLocaleDateString(lang, {
    month: "2-digit",
    day: "2-digit"
  });
}

function isoDate(date: Date): string {
  const de = date.toLocaleDateString("de", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
  return de
    .split(".")
    .reverse()
    .join("-");
}

function localISODateTime(date: Date): string {
  return isoDate(date) + " " + date.toLocaleTimeString("de");
}

function getPlaceFromUrl() {
  let place = getUrlParam("place");
  if (!place) {
    const parts = window.location.pathname.split("/");
    if (parts.length > 1) place = parts[1];
  }
  return place;
}

function getUrlParam(param: string) {
  var sPageURL = window.location.search.substring(1);

  var sURLVariables = sPageURL.split("&");

  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] == param) {
      return sParameterName[1];
    }
  }
}
