'use babel';

import * as generator from 'cerebral-cli-generator';

import { CompositeDisposable } from 'atom';

class SignalBootstrap {
    constructor() {
        this.subscriptions = null;
    }

    activate() {
        this.subscriptions = new CompositeDisposable();

        const commands = atom.commands.add('atom-workspace', {
            'cerebral-signal-helper:executeOnCurrentFile': () =>
                this.executeOnCurrentFile()
        });

        this.subscriptions.add(commands);
    }

    deactivate() {
        this.subscriptions.dispose();
    }

    executeOnCurrentFile() {
        const editor = atom.workspace.getActiveTextEditor();

        const fileContent = editor.getText();
        const filePath = editor.getPath();

        const result = generator.performOnFile({
            filePath,
            write: false,
            logger: console,
            content: fileContent
        });

        if (!result) {
            atom.notifications.addWarning(
                '<strong>Cerebral signal helper:</strong><br />' +
                    "Couldn't process file or did not find anything to create.."
            );

            return;
        }

        editor.setText(result);
    }
}

const signalBootstrap = new SignalBootstrap();

export const activate = () => signalBootstrap.activate();
export const deactivate = () => signalBootstrap.deactivate();
