
import fs = require('fs');
import https = require('https');

module ParseLogic {
	
	export function readFile(fileName, onData: (pdfBuffer: Buffer) => any) {
    	fs.readFile("plan.pdf", function (err, pdfBuffer) {
        	if (!err) {
				console.log("filesize: " + pdfBuffer.length / 1024 + " kB");
				onData(pdfBuffer);
        	}
		});    
	}
    
	
	export module WebData {
		
		export function loadFromServer(filePath: string, onDone: () => any) {

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
		
				res.on('end', function (data: string) {
		
					console.log(address + " loaded");
					file.end();
					onDone();
				});
		
				res.on('data', function (data: string) {
		
					file.write(data);
				});
			});
		}
	}
}

export = ParseLogic;