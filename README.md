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

- `capture_screen`: Capture the entire screen as an image. Supports `format` (png/jpeg) and `quality` (jpeg only) parameters.
- `capture_region`: Capture a specific region of the screen. Requires `left`, `top`, `width`, `height`. Supports `format` and `quality`.
- `get_screen_size`: Get the dimensions (width and height) of the screen.

### Mouse Control

- `move_mouse`: Move the mouse cursor to a specific `x`, `y` position.
- `get_mouse_position`: Get the current `x`, `y` position of the mouse cursor.
- `click_mouse`: Click the mouse at the current position. Optional `button` (left, middle, right).
- `click_at`: Click the mouse at a specific `x`, `y` position. Optional `button`.
- `double_click`: Double-click the mouse at the current position.
- `double_click_at`: Double-click the mouse at a specific `x`, `y` position.
- `scroll_mouse`: Scroll the mouse wheel. Requires `direction` (up/down). Optional `amount`.
- `drag_mouse`: Drag the mouse from the current position to a target `x`, `y` position.
- `drag_mouse_from_to`: Drag the mouse from a `startX`, `startY` position to an `endX`, `endY` position.

### Keyboard Input

- `type_text`: Type text at the current cursor position. Requires `text`.
- `type_text_with_delay`: Type text with a delay between keystrokes. Requires `text`. Optional `delayMs`.
- `press_key`: Press a specific keyboard key. Requires `key`.
- `press_key_shortcut`: Press a keyboard shortcut (combination of keys). Requires `keys` array.
- `hold_key`: Hold down a keyboard key. Requires `key`.
- `release_key`: Release a held keyboard key. Requires `key`.

### Clipboard Operations

- `get_clipboard_text`: Get text from the clipboard.
- `set_clipboard_text`: Set text to the clipboard. Requires `text`.
- `copy_selected_text`: Copy selected text to clipboard and return it (uses Ctrl+C/Cmd+C).
- `paste_text`: Paste text at current cursor position (uses Ctrl+V/Cmd+V). Requires `text`.
- `get_clipboard_image`: Get image from the clipboard (if available) as base64 data.

### UI Automation Tools (Windows Only)

These tools use Windows UI Automation via PowerShell to interact with UI elements.

- `get_ui_element_info`: Finds a UI element within a specified window and returns its properties (Name, AutomationId, ClassName, ControlType, BoundingRectangle, IsEnabled, IsOffscreen, Value, Children).
  - Requires `windowTitle` (can be partial match).
  - Requires at least one of `elementName`, `automationId`, or `className` to find a specific element.
  - If no element identifier is provided, it lists the direct children of the window.
- `invoke_ui_element_action`: Performs an action on a specified UI element.
  - Requires `windowTitle`.
  - Requires `action` (`Click`, `SetValue`, or `Focus`).
  - Requires at least one of `elementName`, `automationId`, or `className`.
  - Requires `valueToSet` (string) if `action` is `SetValue`.

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
