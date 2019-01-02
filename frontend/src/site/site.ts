import { Plan } from "../model/plan";
import { shortDate, localISODateTime } from "../util/index";
import { Day } from "../model/day";

import { DayListContainer } from "./day-list-container";
import { DayContainer } from "./day-container";

export class Site {
  div: JQuery<HTMLElement>;
  daysContainer: DayListContainer;
  plan: Plan | undefined;
  info: { planCreationDate: Date } | undefined;

  constructor(divId: string, public lang: string, public place: string) {
    this.div = $(`#${divId}`);
    this.daysContainer = DayListContainer.create();
  }

  public update() {
    if (this.plan && this.info) this.show(this.plan, this.info);
  }

  public show(plan: Plan, info: { planCreationDate: Date }) {
    this.plan = plan;
    this.info = info;
    localStorage.setItem("lang", this.lang);

    this.daysContainer.clear();

    const days = plan[this.place].plans[this.lang];
    days.forEach((day, index) => {
      const dayDiv = this.createDay(day);
      this.daysContainer.append(dayDiv);
      if (new Date(day.date).getDay() === 5 && index < days.length - 1) {
        this.daysContainer.append('<div class="weekend">');
      }
    });

    const min = shortDate(new Date(days[0].date), this.lang);
    const max = shortDate(new Date(days[days.length - 1].date), this.lang);

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
    if (this.lang === "en") headerContent = `Meal from ${min} to ${max}`;
    titleElement.html(headerContent);

    const header = $(`#${this.div.attr("id")} > header`);
    header.html("");
    header.append(menuElement);
    header.append(titleElement);

    const timestamp = localISODateTime(info.planCreationDate);
    let footerContent = "generiert: " + timestamp;
    if (this.lang === "en") {
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
    this.daysContainer.scrollTo(currentDayContainer);
  }

  private createDay(day: Day) {
    return DayContainer.create(day, this.lang).div;
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
      this.lang = "de";
      this.update();
    });
    createMenuLink("flag-icon flag-icon-gb", "englisch", () => {
      this.lang = "en";
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
