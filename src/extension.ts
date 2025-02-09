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
	const fetchWithDebounce = debounce(async (url: string) => {
		const response = await fetch(url);
		if (response.status === 403) {
			const data = await response.json() as { message?: string };
			if (data.message && data.message.includes('API rate limit exceeded')) {
				throw new Error('API rate limit exceeded. Please try again later.');
			}
		}
		return response.json();
	}, 1000);

	let cachedDirectories: string[] | null = null;
	let cachedImages: { [key: string]: any[] } = {};

	const randomDisposable = vscode.commands.registerCommand('animeholdingbooks.random', async (panel?: vscode.WebviewPanel) => {
		try {
			if (!cachedDirectories) {
				const data = await fetchWithDebounce('https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents') as any[];
				cachedDirectories = data.filter((item: any) => item.type === 'dir').map((dir: any) => dir.name);
			}

			const randomDirectory = cachedDirectories![Math.floor(Math.random() * cachedDirectories!.length)];

			vscode.commands.executeCommand('animeholdingbooks.randomFromCategory', randomDirectory, panel);
		} catch (error: any) {
			if (error.message.includes('API rate limit exceeded')) {
				vscode.window.showErrorMessage(error.message);
			} else if (error instanceof TypeError) {
				vscode.window.showErrorMessage('Network error: Failed to fetch a random image');
			} else {
				vscode.window.showErrorMessage('Unexpected error: ' + error.message);
			}
		}
	});

	const randomFromCategoryDisposable = vscode.commands.registerCommand('animeholdingbooks.randomFromCategory', async (directoryName?: string, panel?: vscode.WebviewPanel) => {
		try {
			if (!directoryName) {
				if (!cachedDirectories) {
					const data = await fetchWithDebounce('https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents') as any[];
					cachedDirectories = data.filter((item: any) => item.type === 'dir').map((dir: any) => dir.name);
				}

				directoryName = await vscode.window.showQuickPick(cachedDirectories!, { placeHolder: 'Select a directory' });
				if (!directoryName) {
					vscode.window.showErrorMessage('No directory name provided');
					return;
				}
			}

			if (!cachedImages[directoryName]) {
				const dirData = await fetchWithDebounce(`https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents/${directoryName}`) as any[];
				cachedImages[directoryName] = dirData.filter((item: any) => item.type === 'file' && item.name.match(/\.(jpg|jpeg|png|gif)$/));
			}

			const images = cachedImages[directoryName];
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
						localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
						}
					);
			}

			panel.webview.html = getWebviewContent(context, panel, imageUrl, imageName, false);

			panel.webview.onDidReceiveMessage(
				async message => {
					if (message.command === 'animeholdingbooks.renew') {
						panel!.webview.html = getWebviewContent(context, panel!, '', '', true);
						vscode.commands.executeCommand('animeholdingbooks.random', panel);
					}
				},
				undefined,
				context.subscriptions
			);
		} catch (error: any) {
			if (error.message.includes('API rate limit exceeded')) {
				vscode.window.showErrorMessage(error.message);
			} else if (error instanceof TypeError) {
				vscode.window.showErrorMessage('Network error: Failed to fetch images from the specified directory: ' + directoryName);
			} else {
				vscode.window.showErrorMessage('Unexpected error: ' + error.message);
			}
		}
	});

	context.subscriptions.push(randomFromCategoryDisposable);
	context.subscriptions.push(randomDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, imageUrl: string, imageName: string, isLoading: boolean): string {
	const displayStyle = isLoading ? 'block' : 'none';
	const imageStyle = isLoading ? 'none' : 'block';
	const loadingImageSrc = vscode.Uri.joinPath(context.extensionUri, 'media', 'loading.svg');
	const webviewUri = panel.webview.asWebviewUri(loadingImageSrc);
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
			<img id="loading" src="${webviewUri}" alt="Loading..." style="display: ${displayStyle};" />
			<img id="content" src="${imageUrl}" alt="${imageName}" style="display: ${imageStyle};" />
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

function debounce(func: (...args: any[]) => Promise<any>, wait: number) {
	let timeout: NodeJS.Timeout;
	return (...args: any[]) => {
		clearTimeout(timeout);
		return new Promise((resolve, reject) => {
			timeout = setTimeout(() => func(...args).then(resolve).catch(reject), wait);
		});
	};
}
