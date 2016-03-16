'use babel';

import * as babylon from 'babylon';

export function parse(text) {
    const source = babylon.parse(text, {sourceType: 'module'});
    const body = source.program.body;
    const imports = body.filter(node => node.type === 'ImportDeclaration').map(node => {
        const name = node.specifiers.find(obj => obj.local.type === 'Identifier').local.name;
        const path = node.source.value;

        return {name, path};
    });

    const exportDefaultDeclaration = body.find(node => node.type === 'ExportDefaultDeclaration');
    if (!exportDefaultDeclaration) {
        return;
    }

    const signalDeclaration = exportDefaultDeclaration.declaration;
    if (signalDeclaration.type === 'ArrayExpression') {
        const elements = signalDeclaration.elements;
        const parts = parseCollection(elements);
        const uniqueParts = parts.reduce((unique, part) => {
            const found = unique.find(item => item.name === part.name);
            if (found) {
                found.argumentCount = Math.max(found.argumentCount, part.argumentCount);
            } else {
                unique.push(part);
            }
            return unique;
        }, []);

        return {imports, parts: uniqueParts, type: 'SignalFile'};
    }

    if (signalDeclaration.type === 'ObjectExpression') {
        const elements = signalDeclaration.properties;
        const parts = parseCollection(elements);

        return {imports, parts, type: 'SignalDefinitionsFile'};
    }

    if (text.indexOf('module.addSignals') > -1) {
        const r = new RegExp(/module\.addSignals\((\{[\w\W]+\})\)\;/g);
        const result = r.exec(text);
        if (result && result.length > 1) {
            const parsed = parse('export default ' + result[1]);
            return {imports, parts: parsed.parts, type: 'ModuleFile'};
        }
    }

    return false;
}

function parseCollection(collection) {
    let foundParts = [];
    let lastPart = null;

    for (const element of collection) {
        const part = {};
        if (element.type === 'CallExpression') {
            part.type = 'factory';
            part.name = element.callee.name;
            part.argumentCount = element.arguments.length;
        } else if (element.type === 'ObjectExpression') {
            if (lastPart) {
                lastPart.outputs = element.properties.map(prop => prop.key.name);
            }

            const subParts = element.properties.reduce((all, prop) => all.concat(parseCollection(prop.value.elements)), [])
            foundParts.push(...subParts);

            continue;
        } else if (element.type === 'Identifier') {
            part.type = 'action';
            part.name = element.name;
        } else if (element.type === 'SpreadElement') {
            part.type = 'chain';
            if (element.argument.type === 'CallExpression') {
                part.name = element.argument.callee.name;
                part.couldAlsoBe = part.couldAlsoBe ? part.couldAlsoBe.push('factory') : ['factory'];
            } else {
                part.name = element.argument.name;
            }
        } else if (element.type === 'ObjectProperty') {
            part.type = 'signal';
            if (element.value.type === 'ObjectExpression') {
                const chainProp = element.value.properties.find(item => item.key.name === 'chain');
                if (!chainProp) {
                    continue;
                }
                part.name = chainProp.value.name;
            } else {
                if (!element.value.name) {
                    continue;
                }
                part.name = element.value.name;
            }
        } else {
            console.log(element);
            continue;
        }

        foundParts.push(part);
        lastPart = part;
    }

    return foundParts;
}
