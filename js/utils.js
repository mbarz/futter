var Utils;
(function (Utils) {
    function getTodaysWeekNr() {
        var now = new Date();
        var year = now.getFullYear();
        var firstOfJanuaryThisYear = new Date(now.getFullYear(), 0, 1);
        var differenceInMs = now.getTime() - firstOfJanuaryThisYear.getTime();
        var weekNr = Math.ceil((differenceInMs / 1000 / 60 / 60 / 24 + firstOfJanuaryThisYear.getDay()) / 7);
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
            "Sonntag"];
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
        var ret = "";
        while (text.search("%") >= 0) {
            var startIndex = text.search("%");
            ret += text.substring(0, startIndex);
            var endIndex = startIndex + 3;
            //console.log("end: " + text[endIndex]);
            while (text[endIndex] == '%')
                endIndex += 3;
            //console.log("sub: " + text.substring(startIndex, endIndex));
            var numbers = text.substring(startIndex, endIndex);
            var splitted = numbers.split("%");
            var array = new Uint8Array(splitted.length);
            var outarray = [];
            for (var i = 1; i < splitted.length; ++i) {
                array[i] = parseInt("0x" + splitted[i]);
                outarray.push(array[i]);
            }
            //console.log(outarray.join());
            ret += Utils.Utf8ArrayToStr(array);
            //ret += Utf8ArrayToStr(array);
            text = text.substring(endIndex);
        }
        ret += text;
        ret = ret.replace("&#0836432;", "&euro; ").replace("&#04432;", ", ").replace("&#0323832;", " & ").replace("&#03234;", " \"");
        return ret;
    }
    Utils.convertToHTML = convertToHTML;
})(Utils || (Utils = {}));
module.exports = Utils;
