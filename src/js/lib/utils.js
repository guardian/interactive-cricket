export function getURLParameter(param) {
    if (!window.location.search) {
      return;
    }
    var m = new RegExp(param + '=([^&]*)').exec(window.location.search.substring(1));
    if (!m) {
      return;
    }
    return decodeURIComponent(m[1]);
}