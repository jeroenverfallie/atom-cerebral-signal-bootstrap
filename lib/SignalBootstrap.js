'use babel';

import * as fs from 'fs';
import * as path from 'path';

import SignalFileParser from './SignalFileParser.js';
import SignalDefinitionsFileParser from './SignalDefinitionsFileParser.js';

import {CompositeDisposable} from 'atom';

const typePath = {
    factory: 'factories',
    chain: 'chains',
    action: 'actions',
    signal: 'signals'
};

export const config = {
    showConfirmation: {
        title: 'Show confirmation',
        description: 'Instead of instantly executing, it will show a confirmation with the steps it will perform',
        type: 'boolean',
        default: true
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

        this.showConfirmation = atom.config.get('atom-cerebral-signal-bootstrap.showConfirmation');
        atom.config.observe('atom-cerebral-signal-bootstrap.showConfirmation', value => this.showConfirmation = value);

        this.addons = atom.config.get('atom-cerebral-signal-bootstrap.addons');
        atom.config.observe('atom-cerebral-signal-bootstrap.addons', value => this.addons = value);

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

        let parseResult = SignalFileParser.parse(text);

        if (parseResult) {
            const moduleDirPath = path.resolve(path.join(path.dirname(filePath), '..'));

            const parseResultWithcontent = SignalFileParser.addContent(parseResult);
            let addImports = '';

            parseResultWithcontent.map((item) => {
                if (item.type !== 'import') {
                    let fromPath;
                    if (this.addons.indexOf(item.name) > -1) {
                        fromPath = `cerebral-addons/${item.name}`;
                    } else {
                        fromPath = `../${typePath[item.type]}/${item.name}.js`;
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

        parseResult = SignalDefinitionsFileParser.parse(text);
        if (parseResult !== false) {
            const moduleDirPath = path.resolve(path.dirname(filePath));
            let addImports = '';

            parseResult.map((signalName) => {
                this.createFile(path.join(moduleDirPath, typePath.signal), signalName + '.js', 'export default [\n\n];');

                addImports += `import ${signalName} from './${typePath.signal}/${signalName}.js';\n`;
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
