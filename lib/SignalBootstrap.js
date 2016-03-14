'use babel';

import * as fs from 'fs';
import * as path from 'path';

import SignalFileParser from './SignalFileParser.js';

import {CompositeDisposable} from 'atom';

const typePath = {
    factory: 'factories',
    chain: 'chains',
    action: 'actions'
};

class SignalBootstrap {
    constructor() {
        this.subscriptions = null;
    }

    activate() {
        this.subscriptions = new CompositeDisposable();

        const commands = atom.commands.add('atom-workspace', {
            'atom-cerebral-signal-bootstrap:parse': () => this.parse()
        });

        this.subscriptions.add(commands);
    }

    deactivate() {
        this.subscriptions.dispose();
    }

    parse() {
        const editor = atom.workspace.getActiveTextEditor();

        const text = editor.getText();
        const filePath = editor.getPath();

        const moduleDirPath = path.resolve(path.join(path.dirname(filePath), '..'));

        const parseResult = SignalFileParser.parse(text);
        if (!parseResult) {
            console.warn('Cerebral Signal Bootstrap: no signal..');
            return;
        }

        const parseResultWithcontent = SignalFileParser.addContent(parseResult);
        let addImports = '';

        parseResultWithcontent.map((item) => {
            if (item.type !== 'import') {
                this.createFile(path.join(moduleDirPath, typePath[item.type]), item.name + '.js', item.content);

                addImports += `import ${item.name} from '../${typePath[item.type]}/${item.name}.js';\n`;
            }
        });

        editor.setText(addImports + '\n\n' + text);
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


export default new SignalBootstrap();
