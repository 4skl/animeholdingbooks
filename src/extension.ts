// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "animeholdingbooks" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const randomDisposable = vscode.commands.registerCommand('animeholdingbooks.random', async (panel?: vscode.WebviewPanel) => {
		try {
			const response = await fetch('https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents');
			const data = await response.json();

			console.log(data);
			const directories = data.filter((item: any) => item.type === 'dir').map((dir: any) => dir.name);

			const randomDirectory = directories[Math.floor(Math.random() * directories.length)];

			vscode.commands.executeCommand('animeholdingbooks.randomFromCategory', randomDirectory, panel);
		} catch (error) {
			vscode.window.showErrorMessage('Failed to fetch a random image');
		}
	});

	const randomFromCategoryDisposable = vscode.commands.registerCommand('animeholdingbooks.randomFromCategory', async (directoryName?: string, panel?: vscode.WebviewPanel) => {
		try {
			if (!directoryName) {
				const response = await fetch('https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents');
				const data = await response.json();
				const directories = data.filter((item: any) => item.type === 'dir').map((dir: any) => dir.name);

				directoryName = await vscode.window.showQuickPick(directories, { placeHolder: 'Select a directory' });
				if (!directoryName) {
					vscode.window.showErrorMessage('No directory name provided');
					return;
				}
			}

			const dirResponse = await fetch(`https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents/${directoryName}`);
			const dirData = await dirResponse.json();

			console.log(dirData);
			const images = dirData.filter((item: any) => item.type === 'file' && item.name.match(/\.(jpg|jpeg|png|gif)$/));
			if (images.length === 0) {
				vscode.window.showErrorMessage('No images found in the specified directory');
				return;
			}

			const randomImage = images[Math.floor(Math.random() * images.length)];
			const imageUrl = randomImage.download_url;
			const imageName = randomImage.name;

			if (!panel) {
				panel = vscode.window.createWebviewPanel(
					'randomImageFromDirectory', // Identifies the type of the webview. Used internally
					imageName, // Title of the panel displayed to the user
					vscode.ViewColumn.One, // Editor column to show the new webview panel in.
					{
						// Enable scripts in the webview
						enableScripts: true,
					}
				);
			}

			panel.webview.html = getWebviewContent(imageUrl, imageName);

			panel.webview.onDidReceiveMessage(
				async message => {
					if (message.command === 'animeholdingbooks.renew') {
						vscode.commands.executeCommand('animeholdingbooks.random', panel);
					}
				},
				undefined,
				context.subscriptions
			);
		} catch (error) {
			vscode.window.showErrorMessage('Failed to fetch images from the specified directory : ' + directoryName + ' : ' + error);
		}
	});

	context.subscriptions.push(randomFromCategoryDisposable);
	context.subscriptions.push(randomDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(imageUrl: string, imageName: string): string {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${imageName}</title>
		<style>
			body {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}
			img {
				max-width: 100%;
				max-height: 80vh;
			}
			button {
				margin-top: 20px;
				padding: 10px 20px;
				font-size: 16px;
				cursor: pointer;
				background-color: var(--vscode-button-background);
				color: var(--vscode-button-foreground);
				border: none;
				border-radius: 2px;
			}
			button:hover {
				background-color: var(--vscode-button-hoverBackground);
			}
		</style>
	</head>
	<body>
		<img src="${imageUrl}" alt="${imageName}" data-vscode-context='{"webviewSection": "editor", "preventDefaultContextMenuItems": true}'/>
		<button onclick="getAnotherImage()">Get Another Image</button>
		<script>
			const vscode = acquireVsCodeApi();
			function getAnotherImage() {
				vscode.postMessage({ command: 'animeholdingbooks.renew' });
			}
		</script>
	</body>
	</html>`;
}
