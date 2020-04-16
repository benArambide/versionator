var path = require('path');
var semver = require('semver');
var fs = require('fs');

var Common = (function() {
    var commonPublicAPI = {};
    var VERSIONATOR_PREFIX = 'VERSIONATOR:';
    var addPrefix = function(message) { return `${VERSIONATOR_PREFIX} ${message}`; };

    commonPublicAPI.printError = function(msg) {
    if (process.env.VERSIONATOR_UPDATE_SILENT  === 'true') return false;
    if (msg instanceof Error)
        return console.error(addPrefix(msg.message));
    return console.error.apply(console, arguments);
    };
    
    commonPublicAPI.log = function(msg) {
    if (process.env.VERSIONATOR_UPDATE_SILENT  === 'true') return false;
        return console.log(addPrefix(msg));
    }
    
    commonPublicAPI.warn = function(msg) {
    if (process.env.VERSIONATOR_UPDATE_SILENT  === 'true') return false;
        return console.log(addPrefix(msg));
    }
    
    commonPublicAPI.printOut = function() {
    if (process.env.VERSIONATOR_UPDATE_SILENT === 'true'  === 'true') return false;
        return console.log.apply(console, arguments);
    };

    return commonPublicAPI;
})();

(function() {
    var argv = require('minimist')(process.argv.slice(2));

    var inc = argv.inc || null;
    var preid = argv.preid || null;
    var commmit = argv.commit || 'true';
    var push = argv.push || 'false';
    var tag = argv.tag || 'false';

    var validInc = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];
    var package_file = path.join(process.cwd(), 'package.json');
    var package_json = require(package_file);
    var isValidInc = function(paramValue) { return paramValue && validInc.includes(paramValue); };

    if(!isValidInc(inc)) {
        throw new Error('An invalid argument was supplied');
        return;
    }

    package_json.version = semver.inc(package_json.version, inc, preid);
    Common.log(`The version was updated to ${package_json.version}`);

    fs.writeFile(package_file, JSON.stringify(package_json, null, 2), function(err, data) {
        if (err) {
            Common.printError(err);
            throw new Error(err)
            return;
        };
    });

    var commitCMD = commmit == 'true' ? `git add . ; git commit -m "${package_json.version}";` : '';
    var pushCMD = push === 'true' ? 'git push origin HEAD;' : '';
    var includePushTag = tag === 'true' ? '--tags' : '';
    var tagCMD = tag === 'true' ? `git tag ${package_json.version} ${includePushTag};` : '';

    var cmdExec = `${commitCMD}${pushCMD}`;

    if(cmdExec !== '') {
        Common.log('git settings');
        require('shelljs').exec(cmdExec, function(code) {
            Boolean(commitCMD) && Common.log(`The version was commited!`);
            Boolean(tagCMD) && Common.log(`Tag was created!`);
            Boolean(pushCMD) && Common.log(`The version was pushed!`);
            return;
        });
    }

})();