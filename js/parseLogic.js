var fs = require('fs');
var https = require('https');
var ParseLogic;
(function (ParseLogic) {
    function readFile(fileName, onData) {
        fs.readFile("plan.pdf", function (err, pdfBuffer) {
            if (!err) {
                console.log("filesize: " + pdfBuffer.length / 1024 + " kB");
                onData(pdfBuffer);
            }
        });
    }
    ParseLogic.readFile = readFile;
    var WebData;
    (function (WebData) {
        function loadFromServer(filePath, onDone) {
            var webAddress = "https://gpartner.erlm.siemens.de/sp-tool/dl/";
            var file = fs.createWriteStream(filePath);
            var year = 2014;
            var brunswikId = 107;
            var now = new Date();
            var firstOfJanuaryThisYear = new Date(now.getFullYear(), 0, 1);
            var differenceInMs = now.getTime() - firstOfJanuaryThisYear.getTime();
            var weekNr = Math.ceil((differenceInMs / 1000 / 60 / 60 / 24 + firstOfJanuaryThisYear.getDay()) / 7);
            console.log("beginning to load pdf for week " + weekNr);
            var address = webAddress + year + "0" + weekNr + "" + brunswikId + "de.pdf";
            var request = https.get(address, function (res) {
                res.on('end', function (data) {
                    console.log(address + " loaded");
                    file.end();
                    onDone();
                });
                res.on('data', function (data) {
                    file.write(data);
                });
            });
        }
        WebData.loadFromServer = loadFromServer;
    })(WebData = ParseLogic.WebData || (ParseLogic.WebData = {}));
})(ParseLogic || (ParseLogic = {}));
module.exports = ParseLogic;
