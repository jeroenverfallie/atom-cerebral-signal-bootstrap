'use babel';

import chainTemplate from './templates/chain.js';
import factoryTemplate from './templates/factory.js';
import actionTemplate from './templates/action.js';
import signalTemplate from './templates/signal.js';

export function generateContent(parts) {
    return parts.map(item => {
        if (item.type === 'factory') {
            item.content = factoryTemplate(item);
        }
        if (item.type === 'action') {
            item.content = actionTemplate(item);
        }
        if (item.type === 'chain') {
            item.content = chainTemplate(item);
        }
        if (item.type === 'signal') {
            item.content = signalTemplate(item);
        }
        return item;
    });
}
