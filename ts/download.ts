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


        // https://www.realestate.siemens.com/restaurant-services/speiseplaene/wp_d.php?rid=133021011&week=51&sto=bwg_a
        var rid = 133021011;
        var sto = "bwg_a"

        var now = new Date();
        var year = now.getFullYear();
        var brunswikId = 107;

        var hostname = 'www.realestate.siemens.com';
        var webAddress = "/restaurant-services/speiseplaene/wp_d.php?";
        var address = webAddress + "rid=" + rid + "&week=" + weekNr + "&sto=" + sto;
        //console.log('https://' + hostname + address);

        var options = {
            hostname: hostname,
            port: 443, rejectUnauthorized: false,
            path: address
        };
        
        stream.on('finish', () => { 
            
            onLoaded(filePath);
        });

        var request = https.get(options, (res) => {


            res.on('end', (data: string) => {

                console.log(address.match(/week=[0-9]*/) + " loaded");
                stream.end();
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