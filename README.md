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

## Requirements

- VS Code 1.74 or later.
