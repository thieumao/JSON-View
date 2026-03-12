# JSON View

A VS Code extension to view JSON files in a tree with **expand/collapse** for each object and array.

## Features

- **JSON tree**: Displays JSON as a tree for easier reading and navigation.
- **Expand/collapse**: Click the ▶/▼ icon next to an object `{}` or array `[]` to expand or collapse.
- **Expand all / Collapse all**: Toolbar buttons to expand or collapse all nodes at once.
- **Syntax highlighting**: Keys, strings, numbers, booleans, and null use VS Code theme colors.
- **Live update**: When the JSON file changes on disk, the view updates automatically.

## Usage

1. **Open a .json file** with JSON View:
   - Right-click the file → **Reopen Editor With...** → **JSON View**.
   - Or open a JSON file and click **Open with JSON View** in the editor title bar.

2. **Command**: Command Palette (`Ctrl+Shift+P`) → run **"Open with JSON View"** while a JSON file is open.

## Development

This project uses **Yarn**. Install and build:

```bash
yarn install
yarn compile
```

In VS Code: **Run > Start Debugging** (F5) to open the Extension Development Host and try the extension.

## How to use this extension in VS Code

### Option A: Run for testing (Extension Development Host)

1. Open the **JsonView** project folder in VS Code (`File > Open Folder`).
2. Press **F5** (or **Run > Start Debugging**).
3. A new VS Code window opens with your extension loaded. In that window:
   - Open any `.json` file.
   - Right-click the tab → **Reopen Editor With...** → **JSON View** (or use the **Open with JSON View** button in the title bar).

### Option B: Install from folder (use in your main VS Code)

1. Build the extension: `yarn compile`.
2. Press **Ctrl+Shift+P** → run **Extensions: Install from Location...** (or **Developer: Install Extension from Location...**).
3. Choose the folder `d:\Projects\VSCode\JsonView`.
4. VS Code installs the extension; reload the window if asked. You can then use **Reopen Editor With... > JSON View** on any JSON file.

### Option C: Install from .vsix (share or reinstall later)

1. Install the packager: `yarn global add @vscode/vsce` (or `npm install -g @vscode/vsce`).
2. Build and package: `yarn compile` then `vsce package`.
3. You get a file like `json-view-0.1.0.vsix`. In VS Code: **Extensions** view → **...** → **Install from VSIX...** → select that file.

## Requirements

- VS Code 1.74 or later.
