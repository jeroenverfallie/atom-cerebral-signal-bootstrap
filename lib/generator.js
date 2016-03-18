'use babel';

import chainTemplate from './templates/chain.js';
import factoryTemplate from './templates/factory.js';
import actionTemplate from './templates/action.js';
import signalTemplate from './templates/signal.js';

export function generateContent(part) {
    let content;
    switch (part.type) {
        case 'factory':
            content = factoryTemplate(part);
            break;
        case 'action':
            content = actionTemplate(part);
            break;
        case 'chain':
            content = chainTemplate(part);
            break;
        case 'signal':
            content = signalTemplate(part);
            break;
        default:
            content = ''
    }

    return content;
}


export function generateImports({parseResult, typePaths, addons = []}) {
    return parseResult.newParts.map(part => {
        let line = '';
        let path = '';
        let shouldCreateFile = false;

        if (parseResult.type === 'SignalFile') {
            if (addons.indexOf(part.identifier) > -1) {
               path = `cerebral-addons/${part.identifier}`;
            } else {
               path = `../${typePaths[part.type]}/${part.identifier}.js`;
               shouldCreateFile = true;
            }
        } else {
            path = `./${typePaths[part.type]}/${part.identifier}.js`;
            shouldCreateFile = true;
        }

        line = `import ${part.identifier} from '${path}';`;

        let content = false;
        if (shouldCreateFile) {
            content = generateContent(part);
        }

        return {
            identifiers: [part.identifier],
            lines: [line],
            path: path,
            shouldCreateFile: shouldCreateFile,
            content
        };
    });
}
