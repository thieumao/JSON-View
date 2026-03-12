import * as vscode from 'vscode';

/**
 * Custom readonly editor provider that renders JSON files in a webview tree with expand/collapse.
 */
export class JsonViewEditorProvider implements vscode.CustomReadonlyEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(
			JsonViewEditorProvider.viewType,
			new JsonViewEditorProvider(context),
			{ webviewOptions: { retainContextWhenHidden: true } }
		);
	}

	private static readonly viewType = 'jsonView.editor';

	constructor(private readonly _context: vscode.ExtensionContext) {}

	async openCustomDocument(
		uri: vscode.Uri,
		_openContext: vscode.CustomDocumentOpenContext,
		_token: vscode.CancellationToken
	): Promise<vscode.CustomDocument> {
		return { uri, dispose: () => {} };
	}

	async resolveCustomEditor(
		document: vscode.CustomDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._context.extensionUri],
		};

		webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);

		/** Sends current document text to the webview so it can render the JSON tree. */
		const sendContent = async () => {
			try {
				const doc = await vscode.workspace.openTextDocument(document.uri);
				webviewPanel.webview.postMessage({
					type: 'setJson',
					text: doc.getText(),
					uri: document.uri.toString(),
				});
			} catch (_) {
				// File may have been deleted
			}
		};

		const watcher = vscode.workspace.createFileSystemWatcher(document.uri.fsPath);
		watcher.onDidChange(sendContent);
		watcher.onDidDelete(() => webviewPanel.dispose());

		await sendContent();

		webviewPanel.onDidDispose(() => watcher.dispose());
	}

	private _getHtmlForWebview(webview: vscode.Webview): string {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.js')
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._context.extensionUri, 'media', 'style.css')
		);

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>JSON View</title>
	<link rel="stylesheet" href="${styleUri}">
</head>
<body>
	<div class="toolbar">
		<button id="btn-expand-all" title="Expand all">⊕ Expand all</button>
		<button id="btn-collapse-all" title="Collapse all">⊖ Collapse all</button>
		<span class="path" id="file-path"></span>
	</div>
	<div id="content">
		<div id="error" class="error hidden"></div>
		<div id="tree-container"></div>
	</div>
	<script src="${scriptUri}"></script>
</body>
</html>`;
	}
}
