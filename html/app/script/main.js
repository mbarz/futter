"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var lang = 'de';
var place = 'bwg';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var site, response, plan, lastModified;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    site = new Site('site');
                    return [4 /*yield*/, fetch('multiLangPlan.json', { mode: 'no-cors' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    plan = _a.sent();
                    lastModified = response.headers.get('Last-Modified');
                    console.log(lastModified);
                    console.log('plan loaded');
                    console.log(plan);
                    lang = getUrlParam('lang') || 'de';
                    place = getUrlParam('place') || 'bwg';
                    console.log({ lang: lang, place: place });
                    site.show(plan, { planCreationDate: new Date(lastModified || '') });
                    return [2 /*return*/];
            }
        });
    });
}
var Site = (function () {
    function Site(divId) {
        this.div = $("#" + divId);
        this.daysContainer = this.createDaysContainer();
    }
    Site.prototype.createDaysContainer = function () {
        var daysContainer = $('#plan');
        daysContainer.mousewheel(function (event, delta) {
            var totalHeight = daysContainer.get(0).scrollHeight;
            if (totalHeight < (daysContainer.height() || totalHeight) + 21) {
                var current = daysContainer.scrollLeft() || 0;
                daysContainer.scrollLeft(current - delta * 30);
                event.preventDefault();
            }
        });
        return daysContainer;
    };
    Site.prototype.show = function (plan, info) {
        var _this = this;
        var days = plan[place].plans[lang];
        days.forEach(function (day) {
            var dayDiv = _this.createDay(day);
            _this.daysContainer.append(dayDiv);
        });
        var min = new Date(days[0].date).toLocaleDateString(lang);
        var max = new Date(days[days.length - 1].date).toLocaleDateString(lang);
        var headerContent = "Speiseplan vom " + min + " bis zum " + max;
        if (lang === 'en')
            headerContent = "Meal from " + min + " to " + max;
        $("#" + this.div.attr('id') + " > header").html(headerContent);
        var footerContent = 'generiert am ' + info.planCreationDate.toLocaleString(lang);
        if (lang === 'en') {
            footerContent = 'generated on ' + info.planCreationDate.toLocaleString(lang);
        }
        $("#" + this.div.attr('id') + " > footer > .content").html(footerContent);
        var day = (new Date()).toISOString().substr(0, 10);
        var currentDayContainer = $('#' + day);
        var offset = currentDayContainer.offset();
        var containerOffset = this.daysContainer.offset();
        if (offset && containerOffset) {
            var paddingLeft = parseInt(this.daysContainer.css('padding-left').replace('px', ''));
            var paddingTop = parseInt(this.daysContainer.css('padding-top').replace('px', ''));
            var left = offset.left - containerOffset.left - paddingLeft;
            var top_1 = offset.top - containerOffset.top - paddingTop;
            this.daysContainer.scrollLeft(left);
            this.daysContainer.scrollTop(top_1);
        }
    };
    Site.prototype.createDay = function (day) {
        var dayDiv = $('<div>');
        dayDiv.addClass('day');
        dayDiv.attr('id', day.date);
        var header = $('<header>');
        var dateOpts = {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        };
        var dateStr = new Date(day.date).toLocaleDateString(lang, dateOpts);
        header.html(dateStr);
        dayDiv.append(header);
        for (var _i = 0, _a = day.meals; _i < _a.length; _i++) {
            var meal = _a[_i];
            var mealDiv = this.createMeal(meal);
            dayDiv.append(mealDiv);
        }
        var rowDef = "auto";
        for (var i = 0; i < day.meals.length; ++i)
            rowDef += ' 1fr';
        dayDiv.css('grid-template-rows', rowDef);
        return dayDiv;
    };
    Site.prototype.createMeal = function (meal) {
        var mealDiv = $('<div>');
        mealDiv.addClass('meal');
        var lines = meal.lines.map(function (line) {
            return decodeURIComponent(line);
        });
        var tempPrices = [];
        var tempLines = [];
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.match(/[0-9]+,[0-9]+/)) {
                this.printLines(mealDiv, tempLines);
                tempLines = [];
                tempPrices.push(line);
            }
            else {
                this.printPrices(mealDiv, tempPrices);
                tempPrices = [];
                tempLines.push(line);
            }
        }
        this.printLines(mealDiv, tempLines);
        this.printPrices(mealDiv, tempPrices);
        return mealDiv;
    };
    Site.prototype.printPrices = function (target, prices) {
        if (prices.length < 1)
            return;
        var div = $('<div>');
        div.addClass('prices');
        div.append($('<div class="spacer">'));
        for (var _i = 0, prices_1 = prices; _i < prices_1.length; _i++) {
            var price = prices_1[_i];
            var priceDiv = $('<div>');
            priceDiv.addClass('price');
            priceDiv.html(price);
            div.append(priceDiv);
        }
        target.append(div);
    };
    Site.prototype.printLines = function (target, lines) {
        if (lines.length < 1)
            return;
        var div = $('<div>');
        div.addClass('description');
        lines.splice(0, 1, "<strong>" + lines[0] + "</strong>");
        div.html(lines.join('<br />'));
        target.append(div);
    };
    return Site;
}());
$(document).ready(main);
function getUrlParam(param) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == param) {
            return sParameterName[1];
        }
    }
}
