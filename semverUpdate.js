
var path = require('path');
var semver = require('semver');
var fs = require('fs');

var Common = (function() {
    var commonPublicAPI = {};

    commonPublicAPI.printError = function(msg) {
    if (process.env.SEMVER_UPDATE_SILENT  === 'true') return false;
    if (msg instanceof Error)
        return console.error(msg.message);
    return console.error.apply(console, arguments);
    };
    
    commonPublicAPI.log = function(msg) {
    if (process.env.SEMVER_UPDATE_SILENT  === 'true') return false;
    return console.log(`${msg}`);
    }
    
    commonPublicAPI.warn = function(msg) {
    if (process.env.SEMVER_UPDATE_SILENT  === 'true') return false;
    return console.log(`${msg}`);
    }
    
    commonPublicAPI.printOut = function() {
    if (process.env.SEMVER_UPDATE_SILENT === 'true'  === 'true') return false;
    return console.log.apply(console, arguments);
    };

    return commonPublicAPI;
})();

(function() {
    var argv = require('minimist')(process.argv.slice(2));

    var inc = argv.inc || null;
    var preid = argv.preid || null;

    var package_file = path.join(process.cwd(), 'package.json');
    var package_json = require(package_file);

    package_json.version = semver.inc(package_json.version, inc, preid);
    Common.printOut(`The version was updated to ${package_json.version}`);

    fs.writeFile(package_file, JSON.stringify(package_json, null, 2), function(err, data) {
        if (err) {
            Common.printError(err);
            throw new Error(err)
            return;
        };
    });

    Common.printOut('Pushing module on Git');
    require('shelljs').exec('git add . ; git commit -m "' + package_json.version + '"; git push origin HEAD', function(code) {
        Common.printOut(`The version was pushed`);
        return;
    });

})();