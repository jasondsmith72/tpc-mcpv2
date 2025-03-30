# Total PC Control

An MCP (Model Context Protocol) server that provides control over your screen, mouse, and keyboard using [nut.js](https://nutjs.dev/).

## ⚠️ Warning: Use with Caution

This software enables programmatic control of your mouse, keyboard, and other system operations. By using this software, you acknowledge and accept that:

- Giving AI models direct control over your computer through this tool can lead to unintended consequences
- The software can control your mouse, keyboard, and other system functions
- You are using this software entirely at your own risk
- The creators and contributors of this project accept NO responsibility for any damage, data loss, or other consequences that may arise from using this software

## Features

- 📷 **Screen Capture**: Capture screenshots of your entire screen or specific regions
- 🖱️ **Mouse Control**: Move the mouse cursor, click, double-click, and scroll
- ⌨️ **Keyboard Input**: Type text and press keyboard shortcuts
- 🪟 **Window Management**: Find, focus, and manipulate application windows
- 📋 **Clipboard Access**: Copy and paste text

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- cmake-js (for building native dependencies)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jasondsmith72/total-pc-control.git
cd total-pc-control
```

2. Install cmake-js globally (required for building native dependencies):
```bash
npm install -g cmake-js
```

3. Install the libnut core library (required for nut.js):
```bash
git clone https://github.com/nut-tree/libnut.git libnut-core
cd libnut-core
npm install
cmake-js rebuild
cd ..
```

4. Install dependencies and build the project:
```bash
npm install
npm run build
```

## Using with Claude for Desktop

1. Edit your Claude for Desktop configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following to your configuration:

```json
{
  "mcpServers": {
    "total-pc-control": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/total-pc-control/build/index.js"
      ]
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/` with the actual path to where you cloned the repository.

3. Restart Claude for Desktop

4. Look for the hammer icon in the Claude interface to indicate available tools.

## Available Tools

### Screen Capture

- `capture_screen`: Capture the entire screen as an image
- `capture_region`: Capture a specific region of the screen

### Mouse Control

- `move_mouse`: Move the mouse cursor to a specific position
- `click_mouse`: Click the mouse at the current position or specified coordinates
- `double_click`: Double-click at the current position or specified coordinates
- `right_click`: Right-click at the current position or specified coordinates
- `scroll_mouse`: Scroll the mouse wheel up or down

### Keyboard Input

- `type_text`: Type text at the current cursor position
- `press_key`: Press a specific keyboard key or key combination
- `hold_key`: Hold down a key
- `release_key`: Release a held key

### Window Management

- `find_window`: Find a window by title or application name
- `focus_window`: Bring a window to the foreground
- `get_active_window`: Get information about the currently active window

### Clipboard Operations

- `copy_to_clipboard`: Copy text to the clipboard
- `paste_from_clipboard`: Get text from the clipboard

## Development

To run the server in development mode:

```bash
npm run dev
```

To run tests:

```bash
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
