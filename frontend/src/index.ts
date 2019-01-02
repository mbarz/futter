import "./style.scss";
import "./.htaccess";
import "./multiLangPlan.json";

import { getUrlParam, getPlaceFromUrl, isoDate } from "./util/index";

console.log(isoDate(new Date()));

import { Site } from "./site/site";

let lang = "de";
let place = "bwg";

async function main() {
  const site = new Site("site", lang, place);

  var headers = new Headers();
  headers.append("pragma", "no-cache");
  headers.append("cache-control", "no-cache");
  const response = await fetch("multiLangPlan.json", {
    mode: "no-cors",
    headers,
    cache: "no-cache"
  });
  const plan = await response.json();
  const lastModified = response.headers.get("Last-Modified") || "unknown";
  lang = getUrlParam("lang") || localStorage.getItem("lang") || "de";
  place = getPlaceFromUrl() || "bwg";
  site.show(plan, {
    planCreationDate: new Date(plan.generationTimestamp || lastModified || "")
  });
}

$(document).ready(main);
