'use babel';

import * as fs from 'fs';
import * as path from 'path';

import * as parser from './parser.js';
import * as generator from './generator.js';

import {CompositeDisposable} from 'atom';

const typePath = {
    factory: 'factories',
    chain: 'chains',
    action: 'actions',
    signal: 'signals'
};

export const config = {
    // showConfirmation: {
    //     title: 'Show confirmation',
    //     description: 'Instead of instantly executing, it will show a confirmation with the steps it will perform',
    //     type: 'boolean',
    //     default: true
    // },
    importSort: {
        title: 'Sort imports',
        description: 'How should new imports be sorted?',
        type: 'string',
        default: 'Type',
        enum: ['Type', 'Appearance']
    },
    addons: {
        title: 'Addons',
        description: 'Which "names" to import from "cerebral-addons"',
        type: 'array',
        default: ['debounce', 'set', 'unset', 'when', 'toggle'],
        items: {
            type: 'string'
        }
    }
};

class SignalBootstrap {
    constructor() {
        this.subscriptions = null;
    }

    activate() {
        this.subscriptions = new CompositeDisposable();

        this.config = {};

        // this.config.showConfirmation = atom.config.get('atom-cerebral-signal-bootstrap.showConfirmation');
        // atom.config.observe('atom-cerebral-signal-bootstrap.showConfirmation', value => this.config.showConfirmation = value);

        this.config.addons = atom.config.get('atom-cerebral-signal-bootstrap.addons');
        atom.config.observe('atom-cerebral-signal-bootstrap.addons', value => this.config.addons = value);

        this.config.importSort = atom.config.get('atom-cerebral-signal-bootstrap.importSort');
        atom.config.observe('atom-cerebral-signal-bootstrap.importSort', value => this.config.importSort = value);

        const commands = atom.commands.add('atom-workspace', {
            'atom-cerebral-signal-bootstrap:execute': () => this.execute()
        });

        this.subscriptions.add(commands);
    }

    deactivate() {
        this.subscriptions.dispose();
    }

    execute() {
        const editor = atom.workspace.getActiveTextEditor();

        const text = editor.getText();
        const filePath = editor.getPath();

        let parseResult = parser.parse(text);

        if (parseResult) {
            const moduleDirPath = parseResult.type === 'SignalFile' ? path.resolve(path.join(path.dirname(filePath), '..')) : path.resolve(path.dirname(filePath));

            let parts = generator.generateContent(parseResult.parts);
            if (this.config.importSort === 'Type') {
                parts = parts.sort((a, b) => {
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
                });
            }

            let addImports = '';
            parts.map((item) => {
                if (!parseResult.imports.find(imp => imp.name === item.name)) {
                    let fromPath = '';
                    let shouldCreate = false;

                    if (parseResult.type === 'SignalFile') {
                        if (this.config.addons.indexOf(item.name) > -1) {
                            fromPath = `cerebral-addons/${item.name}`;
                        } else {
                            fromPath = `../${typePath[item.type]}/${item.name}.js`;
                            shouldCreate = true;
                        }
                    } else {
                        fromPath = `./${typePath[item.type]}/${item.name}.js`;
                        shouldCreate = true;
                    }

                    if (shouldCreate) {
                        this.createFile(path.join(moduleDirPath, typePath[item.type]), item.name + '.js', item.content);
                    }

                    addImports += `import ${item.name} from '${fromPath}';\n`;
                }
            });

            if (addImports !== '') {
                addImports += '\n';
                editor.setText(addImports + text);
            }

            atom.notifications.addSuccess('<strong>Cerebral signal bootstrap:</strong><br /> Finished successfully!');

            return;
        }

        atom.notifications.addWarning(
            '<strong>Cerebral signal bootstrap:</strong><br />' +
            'Couldn\'t process file. Expects structure like: <br />' +
            '<code>export default [....];</code> <br />' +
            'Or signals declaration like: <br />' +
            '<code>export default {....};</code>'
        );
    }

    createFile(folderPath, fileName, content) {
        if (!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath);
        }

        const filePath = path.join(folderPath, fileName);

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content);
        }
    }
}

const signalBootstrap = new SignalBootstrap();

export const activate = () => signalBootstrap.activate();
export const deactivate = () => signalBootstrap.deactivate();
