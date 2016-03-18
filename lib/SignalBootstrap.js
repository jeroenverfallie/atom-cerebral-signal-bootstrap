'use babel';

import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

import * as parser from './parser.js';
import * as generator from './generator.js';

import {CompositeDisposable} from 'atom';

const typePaths = {
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
    importSortAll: {
        title: 'Sort all imports, including already existing ones',
        description: 'This will manage all imports used in the file.',
        type: 'boolean',
        default: true
    },
    importCategorize: {
        title: 'Categorize imports',
        description: 'If enabled, it will add empty lines between "categories" of imports',
        type: 'string',
        default: 'All',
        enum: ['All', 'Only local', 'None']
    },
    importSort: {
        title: 'Sort imports',
        description: 'How imports should be sorted.',
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

        this.config.importSortAll = atom.config.get('atom-cerebral-signal-bootstrap.importSortAll');
        atom.config.observe('atom-cerebral-signal-bootstrap.importSortAll', value => this.config.importSortAll = value);

        this.config.importCategorize = atom.config.get('atom-cerebral-signal-bootstrap.importCategorize');
        atom.config.observe('atom-cerebral-signal-bootstrap.importCategorize', value => this.config.importCategorize = value);

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

        const parseResult = parser.parse(text);
        newImports = generator.generateImports({
            parseResult,
            typePaths,
            addons: this.config.addons
        });

        if (parseResult) {
            let newText = text;
            let imports = newImports;

            if (this.config.importSortAll) {
                let lines = text.split('\n');
                parseResult.imports.map(imp => {
                    for (let i = imp.loc.start; i < imp.loc.end; i++) {
                        lines[i] = '_____REMOVE_THIS_LINE_____';
                    }
                });
                newText = lines
                            .filter(line => line !== '_____REMOVE_THIS_LINE_____')
                            .join('\n');

                imports = [...parseResult.imports, ...newImports];
            }

            if (this.config.importSort === 'Type') {
                imports = imports.sort((a, b) => {
                    if (a.path.slice(0, 1) === '.' && b.path.slice(0, 1) !== '.') {
                        return 1;
                    }

                    if (b.path.slice(0, 1) === '.' && a.path.slice(0, 1) !== '.') {
                        return -1;
                    }

                    if (a.path > b.path) {
                        return 1;
                    }

                    if (a.path < b.path) {
                        return -1;
                    }

                    return 0;
                });
            }

            if (imports && imports.length > 0) {
                let importsText = '';

                // Add gaps between import types
                let lastFirstPartOfPath = false;
                imports.map(imp => {
                    const thisFirstPartOfPath = imp.path.slice(0, 6);
                    if (
                        this.config.importCategorize !== 'None' &&
                        (
                            this.config.importCategorize === 'All' ||
                            (this.config.importCategorize === 'Only local' && thisFirstPartOfPath.slice(0, 1) === '.')
                        ) &&
                        lastFirstPartOfPath && lastFirstPartOfPath !== thisFirstPartOfPath
                    ) {
                        importsText += '\n';
                    }

                    importsText += imp.lines.join('\n') + '\n';
                    lastFirstPartOfPath = thisFirstPartOfPath;
                });

                newText = importsText + '\n' + newText;
                newText = newText.replace(/\n{4,}/, '\n\n\n');

                editor.setText(newText);
            }

            if (newImports && newImports.length) {
                newImports.map(imp => {
                    if (imp.shouldCreateFile) {
                        this.createFile(path.join(path.dirname(filePath), imp.path), imp.content);
                    }
                })
            }

            atom.notifications.addSuccess('<strong>Cerebral signal bootstrap:</strong><br /> Finished successfully!');

            return;
        }

        atom.notifications.addWarning(
            '<strong>Cerebral signal bootstrap:</strong><br />' +
            'Couldn\'t process file. Expects structure like: <br />' +
            '<code>export default [....];</code> <br />' +
            'Or signals declaration like: <br />' +
            '<code>export default {....};</code>' +
            'Or signals declaration like: <br />' +
            '<code>module.addSignals({....});</code>'
        );
    }

    createFile(filePath, content) {
        mkdirp.sync(path.dirname(filePath));

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content);
        }
    }
}

const signalBootstrap = new SignalBootstrap();

export const activate = () => signalBootstrap.activate();
export const deactivate = () => signalBootstrap.deactivate();
