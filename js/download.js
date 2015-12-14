var https = require('https');
var fs = require('fs');
var Utils = require('./utils');
var Download;
(function (Download) {
    var Data = (function () {
        function Data() {
        }
        Data.OUTDIR = "./out/";
        Data.HTMLFILENAME = "plan.html";
        return Data;
    })();
    function loadThisWeekAndSaveAsPdf(onLoaded) {
        var weekNr = Utils.getTodaysWeekNr();
        loadWeek(weekNr, onLoaded);
    }
    Download.loadThisWeekAndSaveAsPdf = loadThisWeekAndSaveAsPdf;
    function loadNextWeekAndSaveAsPdf(onLoaded) {
        var weekNr = Utils.getTodaysWeekNr() + 1;
        loadWeek(weekNr, onLoaded);
    }
    Download.loadNextWeekAndSaveAsPdf = loadNextWeekAndSaveAsPdf;
    function loadWeek(weekNr, onLoaded) {
        var weekNrWithLeadingZeros = "000".substring(("" + weekNr).length) + weekNr;
        var filePath = Data.OUTDIR + weekNrWithLeadingZeros + ".pdf";
        if (!fs.existsSync(Data.OUTDIR)) {
            fs.mkdirSync(Data.OUTDIR);
        }
        var stream = fs.createWriteStream(filePath);
        var weekNrWithLeadingZeros = "000".substring(("" + weekNr).length) + weekNr;
        console.log("beginning to load pdf for week " + weekNrWithLeadingZeros);
        // https://www.realestate.siemens.com/restaurant-services/speiseplaene/wp_d.php?rid=133021011&week=51&sto=bwg_a
        var rid = 133021011;
        var sto = "bwg_a";
        var now = new Date();
        var year = now.getFullYear();
        var brunswikId = 107;
        var hostname = 'www.realestate.siemens.com';
        var webAddress = "/restaurant-services/speiseplaene/wp_d.php?";
        var address = webAddress + "rid=" + rid + "&week=" + weekNr + "&sto=" + sto;
        console.log('https://' + hostname + address);
        var options = {
            hostname: hostname,
            port: 443, rejectUnauthorized: false,
            path: address
        };
        stream.on('finish', function () {
            onLoaded(filePath);
        });
        var request = https.get(options, function (res) {
            res.on('end', function (data) {
                console.log('https://' + hostname + address + " loaded");
                stream.end();
            });
            res.on('data', function (data) {
                stream.write(data);
            });
            res.on('error', function (err) {
                console.log("an error occured");
                console.error(err);
            });
        });
    }
    Download.loadWeek = loadWeek;
})(Download || (Download = {}));
module.exports = Download;
