export function shortDate(date: Date, lang = "de"): string {
  return date.toLocaleDateString(lang, {
    month: "2-digit",
    day: "2-digit"
  });
}

export function isoDate(date: Date): string {
  const de = date.toLocaleDateString("de", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
  return de
    .split(".")
    .reverse()
    .join("-");
}

export function localISODateTime(date: Date): string {
  return isoDate(date) + " " + date.toLocaleTimeString("de");
}

export function getPlaceFromUrl() {
  let place = getUrlParam("place");
  if (!place) {
    const parts = window.location.pathname.split("/");
    if (parts.length > 1) place = parts[1];
  }
  return place;
}

export function getUrlParam(param: string) {
  var sPageURL = window.location.search.substring(1);

  var sURLVariables = sPageURL.split("&");

  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] == param) {
      return sParameterName[1];
    }
  }
}
