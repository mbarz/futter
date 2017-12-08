import { Restaurant } from './restaurant';
import { Data } from './config';
import https = require('https');
import fs = require('fs');

import * as Utils from './utils';
import { Day } from './model';

module Download {

    export function load(restaurant: Restaurant, weekNr, lang: 'de' | 'en'): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            loadWeek(weekNr, restaurant, lang, (fileName) => {
                resolve(fileName);
            });
        });
    }

    export function loadWeek(weekNr: number, restaurant: Restaurant, lang: 'de' | 'en', onLoaded: (fileName: string) => any) {

        var weekNrWithLeadingZeros = "000".substring(("" + weekNr).length) + weekNr;
        var filePath = Data.getPath(`${restaurant.sto}_${lang}_${weekNrWithLeadingZeros}.pdf`);
        if (!fs.existsSync(Data.OUTDIR)) {
            fs.mkdirSync(Data.OUTDIR);
        }
        var stream = fs.createWriteStream(filePath);

        var weekNrWithLeadingZeros = "000".substring(("" + weekNr).length) + weekNr;
        console.log("beginning to load pdf for week " + weekNrWithLeadingZeros);


        // https://www.realestate.siemens.com/restaurant-services/speiseplaene/wp_d.php?rid=133021011&week=51&sto=bwg_a
        const rid = restaurant.rid;
        const sto = restaurant.sto;

        var hostname = 'www.realestate.siemens.com';
        var webAddress = `/restaurant-services/speiseplaene/wp_${lang.substring(0,1)}.php?`;
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