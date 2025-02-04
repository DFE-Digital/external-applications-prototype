// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")

module.exports = function (router) {

    var version = "alpha-sprint-1";

    versionMiddleware(router, version);

}