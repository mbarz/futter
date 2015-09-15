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
        var now = new Date();
        var year = now.getFullYear();
        var brunswikId = 107;
        var hostname = 'gpartner.erlm.siemens.de';
        var webAddress = "/sp-tool/dl/";
        var address = webAddress + year + weekNrWithLeadingZeros + "" + brunswikId + "de.pdf";
        console.log('https://' + hostname + address);
        var options = {
            hostname: hostname,
            port: 443, rejectUnauthorized: false,
            path: address
        };
        var request = https.get(options, function (res) {
            res.on('end', function (data) {
                console.log('https://' + hostname + address + " loaded");
                stream.end();
                onLoaded(filePath);
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
