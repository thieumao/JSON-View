import * as vscode from 'vscode';
import { JsonViewEditorProvider } from './jsonViewEditor';

/**
 * Activates the JSON View extension: registers the custom editor and the "Open with JSON View" command.
 */
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		JsonViewEditorProvider.register(context)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('jsonView.openInJsonView', () => {
			const editor = vscode.window.activeTextEditor;
			if (editor?.document.languageId === 'json') {
				vscode.commands.executeCommand(
					'vscode.openWith',
					editor.document.uri,
					'jsonView.editor'
				);
			} else {
				vscode.window.showInformationMessage('Open a JSON file first, then run this command.');
			}
		})
	);
}

export function deactivate() {}
