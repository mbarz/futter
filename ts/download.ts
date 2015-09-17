import https = require('https');
import fs = require('fs');

import Utils = require('./utils');

module Download {

    class Data {
        public static OUTDIR = "./out/";
        public static HTMLFILENAME = "plan.html";
    }

    export function loadThisWeekAndSaveAsPdf(onLoaded: (fileName: string) => any) {
        var weekNr = Utils.getTodaysWeekNr();
        loadWeek(weekNr, onLoaded);
    }

    export function loadNextWeekAndSaveAsPdf(onLoaded: (fileName: string) => any) {
        var weekNr = Utils.getTodaysWeekNr() + 1;
        loadWeek(weekNr, onLoaded);
    }



    export function loadWeek(weekNr: number, onLoaded: (fileName: string) => any) {

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

        var request = https.get(options, (res) => {


            res.on('end', (data: string) => {

                console.log('https://' + hostname + address + " loaded");
                stream.end();
                onLoaded(filePath);
            });

            res.on('data', (data: string) => {

                stream.write(data);
            });

            res.on('error', (err) => {
                console.log("an error occured");
                console.error(err);
            })
        });
    }
}

export = Download;