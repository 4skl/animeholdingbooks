# Anime Holding Books VS Code Extension

"animeholdingbooks" is a Visual Studio Code extension that fetches random images of anime girls holding programming books from the GitHub repository "cat-milk/Anime-Girls-Holding-Programming-Books".

## Features

- Fetch a random image from the repository.  
  ╘═ Command Palette `Show a random picture`
- Fetch a random image from a specific category.  
  ╘═ Command Palette `Show a random picture from a category`
- Display the image in a VS Code webview panel.
- Refresh the image with a button click.

## Requirements

This extension requires an internet connection to fetch images from the GitHub repository.

## Extension Settings

This extension does not contribute any settings.

## Known Issues

- API rate limits may be exceeded if too many requests are made in a short period.
- Network errors may occur if there is an issue with the internet connection.

## Release Notes

### 0.0.2

Updated README with additional usage instructions.

### 0.0.1

Initial release of animeholdingbooks.

---

## Commands

### `animeholdingbooks.random`

Fetches and displays a random image from the "Anime-Girls-Holding-Programming-Books" GitHub repository. If a webview panel is already open, it will refresh the image in the panel.

### `animeholdingbooks.randomFromCategory`

Fetches and displays a random image from a specific category (directory) within the "Anime-Girls-Holding-Programming-Books" GitHub repository. If a webview panel is already open, it will refresh the image in the panel.

## Development

### Commands

- `npm run compile`: Compile the extension.
- `npm run watch`: Watch for changes and recompile.
- `npm run package`: Package the extension for publishing.
- `npm run lint`: Run ESLint to check for code issues.
- `npm run test`: Run tests using the VS Code test framework.

### Running the Extension

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Open the project in VS Code.
4. Press `F5` to open a new VS Code window with the extension loaded.

### Publishing the Extension

1. Run `npm run package` to create a `.vsix` file.
2. Use the `vsce` tool to publish the extension to the Visual Studio Code Marketplace.

**Enjoy!**
