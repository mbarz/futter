"use strict";
var Utils;
(function (Utils) {
    function getNextMonday(d) {
        var ret = d;
        while (d.getDay() != 1)
            d = new Date(d.valueOf() + 864E5);
        return d;
    }
    function getTodaysWeekNr() {
        var now = new Date();
        var year = now.getFullYear();
        var firstOfJanuaryThisYear = new Date(now.getFullYear(), 0, 1);
        var firstMondayThisYear = getNextMonday(firstOfJanuaryThisYear);
        var differenceInMs = now.getTime() - firstMondayThisYear.getTime();
        var weekNr = Math.ceil((differenceInMs / 1000 / 60 / 60 / 24 + firstMondayThisYear.getDay()) / 7);
        return weekNr;
    }
    Utils.getTodaysWeekNr = getTodaysWeekNr;
    function getDayName(index) {
        var dayNames = [
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag",
            "Sonntag"
        ];
        return dayNames[index % 7];
    }
    Utils.getDayName = getDayName;
    function Utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += c;
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = array[i++];
                    out += ((c & 0x1F) << 6) | (char2 & 0x3F);
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += ((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0);
                    break;
            }
        }
        return "&#" + out + ";";
    }
    Utils.Utf8ArrayToStr = Utf8ArrayToStr;
    function convertToHTML(text) {
        return decodeURIComponent(text);
    }
    Utils.convertToHTML = convertToHTML;
})(Utils || (Utils = {}));
module.exports = Utils;
