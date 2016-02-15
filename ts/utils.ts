module Utils {

    function getNextMonday(d: Date): Date {
        
        var ret = d;
        while (d.getDay() != 1) d = new Date(d.valueOf() + 864E5);
        return d;
    }    
    
    export function getTodaysWeekNr(): number {
        var now = new Date();
        var year = now.getFullYear();
        var firstOfJanuaryThisYear = new Date(now.getFullYear(), 0, 1);
        
        var firstMondayThisYear = getNextMonday(firstOfJanuaryThisYear);
        
        var differenceInMs = now.getTime() - firstMondayThisYear.getTime();
        var weekNr = Math.ceil((differenceInMs / 1000 / 60 / 60 / 24 + firstMondayThisYear.getDay()) / 7);
        return weekNr;
    }

    export function getDayName(index: number) : string {
        var dayNames: string[] = [
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag",
            "Sonntag"];
        return dayNames[index % 7];
    }

    export function Utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    // 0xxxxxxx
                    out += c;
                    break;
                case 12: case 13:
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

    export function convertToHTML(text: string): string {

        return decodeURIComponent(text);
    }
}

export = Utils;