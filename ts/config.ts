import * as PathUtils from 'path';
export class Data {
    public static OUTDIR = "./out/";
    private static HTMLFILENAME = "generated.html";
    private static JSONFILENAME = 'multiLangPlan.json';
    static get HTMLFILEPATH() {
        return Data.getPath(Data.HTMLFILENAME);
    }

    static get JSONFILEPATH() {
        return Data.getPath(Data.JSONFILENAME);
    }

    static getPath(file: string): string {
        return PathUtils.join(Data.OUTDIR, file);
    }
}