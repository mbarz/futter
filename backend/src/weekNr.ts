export class WeekNr {
    public static now() {
        return getTodaysWeekNr();
    }
}

function getTodaysWeekNr(): number {
    var now = new Date();
    var year = now.getFullYear();
    var firstOfJanuaryThisYear = new Date(now.getFullYear(), 0, 1);

    var firstMondayThisYear = getNextMonday(firstOfJanuaryThisYear);

    var differenceInMs = now.getTime() - firstMondayThisYear.getTime();
    var weekNr = Math.ceil((differenceInMs / 1000 / 60 / 60 / 24 + firstMondayThisYear.getDay()) / 7);
    return weekNr;
}

function getNextMonday(d: Date): Date {
    
    var ret = d;
    while (d.getDay() != 1) d = new Date(d.valueOf() + 864E5);
    return d;
}