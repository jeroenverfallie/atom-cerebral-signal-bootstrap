'use babel';

export default {
    parse
};

function parse(content) {
    const findSignalDefintions = new RegExp(/export default \{([\S\s]+)\}\;/gi);
    const findSignalNames = new RegExp(/([\w\.\_]+\s*\:\s*)?([\w\.\_]+)/gi);
    const findImports = new RegExp(/import (\w+)/g);

    const hasSignalDefintions = content.match(findSignalDefintions);
    if (!hasSignalDefintions) {
        return false;
    }

    const imports = findAllByGroup(findImports, content, 1);
    const definitions = findSignalDefintions.exec(content)[1];
    const signalNames = findAllByGroup(findSignalNames, definitions, 2);

    const newSignals = signalNames.filter(signalName => imports.indexOf(signalName) === -1);

    return newSignals.sort((a, b) => {
        if (a > b) {
            return 1;
        }

        if (a < b) {
            return -1;
        }

        return 0;
    });
}

function findAllByGroup(regex, content, captureGroup) {
    var match = regex.exec(content);
    var matches = [];
    while (match) {
        if (match.length < captureGroup + 1) {
            return false;
        }
        matches.push(match[captureGroup]);
        match = regex.exec(content);
    }

    return matches;
}
