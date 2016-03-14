'use babel';

import chainTemplate from './templates/chain.js';
import factoryTemplate from './templates/factory.js';
import actionTemplate from './templates/action.js';

export default {
    parse,
    addContent
};


function parse(content) {
    const findImports = new RegExp(/import (\w+)/g);
    const findSignal = new RegExp(/export default \[([\s\S]+)\];/gi);
    const findWhitespace = new RegExp(/[\s]/g);
    const findFactories = new RegExp(/([\w]+)\(([\"\'\/\:\.\w\,]+)*\)/g);
    const findChains = new RegExp(/\.{3}([\w]+)/g);
    const findOutputs = new RegExp(/([\w\.\'\"]+)\:/g);
    const findActions = new RegExp(/(\w+)/g);

    const imports = findAllByGroup(findImports, content, 1);

    const hasSignal = content.match(findSignal);
    if (!hasSignal) {
        return false;
    }

    const signal = findSignal.exec(content)[1];
    var trimmedSignal = signal.replace(findWhitespace, '');

    const factories = findAllByGroup(findFactories, trimmedSignal, 1);
    trimmedSignal = trimmedSignal.replace(findFactories, '');
    const chains = findAllByGroup(findChains, trimmedSignal, 1);
    trimmedSignal = trimmedSignal.replace(findChains, '');
    const outputs = findAllByGroup(findOutputs, trimmedSignal, 1);
    trimmedSignal = trimmedSignal.replace(findOutputs, '');
    const actions = findAllByGroup(findActions, trimmedSignal, 1);

    const definitions = {};
    defineTypeOnObject(definitions, actions, 'action');
    defineTypeOnObject(definitions, factories, 'factory');
    defineTypeOnObject(definitions, chains, 'chain');
    defineTypeOnObject(definitions, imports, 'import');

    const replaceOutputs = new RegExp('(' + outputs.join('|') + ')', 'g');
    const preparedSignal = outputs.length ? signal.replace(replaceOutputs, '"$1"') : signal;

    const newSignal = createDefinedSignal(preparedSignal, definitions);
    const definedSignal = JSON.parse(newSignal);

    const flat = {};
    defineOutputsAndFlatten(definedSignal, flat);

    const output = [];
    for (const key in flat) {
        delete flat[key].__defined;
        output.push(flat[key]);
    }

    return output.length ? output.sort((a, b) => {
        if (a.type > b.type) {
            return 1;
        }

        if (a.type < b.type) {
            return -1;
        }

        if (a.name > b.name) {
            return 1;
        }

        if (a.name < b.name) {
            return -1;
        }

        return 0;
    }) : false;
}

function addContent(definitions) {
    return definitions.map(item => {
        if (item.type === 'factory') {
            item.content = factoryTemplate(item);
        }
        if (item.type === 'action') {
            item.content = actionTemplate(item);
        }
        if (item.type === 'chain') {
            item.content = chainTemplate(item);
        }
        return item;
    })
}

function defineOutputsAndFlatten(signal, flat) {
    let lastItem = null;
    signal.map((item) => {
        if (item.constructor.name === "Array") {
            defineOutputsAndFlatten(item, flat);
        } else {
            if (!item.__defined && lastItem) {
                const keys = Object.keys(item);
                lastItem.outputs = keys;
                keys.map((key) => defineOutputsAndFlatten(item[key], flat));
            }
            if (item.__defined) {
                flat[item.name] = item;
            }
        }

        lastItem = item;
    });
}

function createDefinedSignal(content, context) {
    var output = content
        .replace(/\s/g, '')
        .replace(/\.{3}/g, '')
        .replace(/\([\'\"\.\/\:\w\,]*\)/gi, '');

    for (var key in context) {
        output = output.replace(new RegExp(key, 'g'), JSON.stringify(context[key]));
    }

    return '[' + output + ']';
}

function defineTypeOnObject(scope, array, type) {
    array.map(function(item) {
        scope[item] = {__defined: true, type: type, name: item};
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
