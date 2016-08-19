'use babel';

import * as generator from 'cerebral-cli-generator';
import * as Config from './config.js';

import {CompositeDisposable} from 'atom';

export const config = Config.options;

class SignalBootstrap {
    constructor() {
        this.subscriptions = null;
    }

    activate() {
        this.subscriptions = new CompositeDisposable();

        const applyKeyMap = (object) => {
            if (typeof object !== 'object') {
                return object;
            }

            const newObject = {};
            Object.keys(object).map(key => {
                const mappedKey = Config.keyMap[key];
                if (mappedKey) {
                    newObject[mappedKey] = applyKeyMap(object[key]);
                } else {
                    newObject[key] = applyKeyMap(object[key]);
                }
            });

            return newObject;
        };

        this.config = {};
        Object.keys(config).map(option => {
            const mappedKey = Config.keyMap[option] || option;
            this.config[mappedKey] = applyKeyMap(atom.config.get('atom-cerebral-signal-bootstrap.' + option));
            atom.config.observe('atom-cerebral-signal-bootstrap.' + option, value => {
                this.config[mappedKey] = applyKeyMap(value);
            });
        });

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

        const fileContent = editor.getText();
        const filePath = editor.getPath();

        const config = this.config;
        config.useRcFile = this.config.general.useRcFile;

        const result = generator.performOnFile({
            filePath,
            write: false,
            config
        });

        if (!result) {
            atom.notifications.addWarning(
                '<strong>Cerebral signal bootstrap:</strong><br />' +
                'Couldn\'t process file. Expects structure like: <br />' +
                '<code>export default [....];</code> <br />' +
                'Or signals declaration like: <br />' +
                '<code>export default {....};</code>' +
                'Or signals declaration like: <br />' +
                '<code>module.addSignals({....});</code>'
            );

            return;
        }

        editor.setText(result);

        if (this.config.showNotification) {
            atom.notifications.addSuccess('<strong>Cerebral signal bootstrap:</strong><br /> Finished successfully!');
        }
    }
}

const signalBootstrap = new SignalBootstrap();

export const activate = () => signalBootstrap.activate();
export const deactivate = () => signalBootstrap.deactivate();
