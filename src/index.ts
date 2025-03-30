import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js"; // Correct import path
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as tools from "./tools/index.js";
// Import specific input types for UI Automation tools
import { GetUiElementInfoInput, InvokeUiElementActionInput } from "./tools/uiAutomation.js";
import { CaptureFormat, Key, MouseButton, Point, Region, ScrollDirection } from "./types.js";

// Create the MCP server instance
const server = new McpServer({
  name: "total-pc-control",
  version: "1.0.0",
});

// Register screen capture tools
server.tool(
  "capture_screen",
  "Capture the entire screen as an image",
  {
    format: z.enum([CaptureFormat.PNG, CaptureFormat.JPEG]).optional().describe("Image format (png or jpeg)"),
    quality: z.number().int().min(1).max(100).optional().describe("JPEG quality (1-100, default: 80)"),
  },
  async ({ format, quality }) => {
    try {
      const imageBase64 = await tools.captureScreen(format, quality);
      return {
        content: [
          {
            type: "text",
            text: `Screen captured successfully. ${imageBase64}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error capturing screen: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "capture_region",
  "Capture a specific region of the screen",
  {
    left: z.number().int().min(0).describe("Left position of the region in pixels"),
    top: z.number().int().min(0).describe("Top position of the region in pixels"),
    width: z.number().int().min(1).describe("Width of the region in pixels"),
    height: z.number().int().min(1).describe("Height of the region in pixels"),
    format: z.enum([CaptureFormat.PNG, CaptureFormat.JPEG]).optional().describe("Image format (png or jpeg)"),
    quality: z.number().int().min(1).max(100).optional().describe("JPEG quality (1-100, default: 80)"),
  },
  async ({ left, top, width, height, format, quality }) => {
    try {
      const region: Region = { left, top, width, height };
      const imageBase64 = await tools.captureRegion(region, format, quality);
      return {
        content: [
          {
            type: "text",
            text: `Screen region captured successfully. ${imageBase64}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error capturing screen region: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_screen_size",
  "Get the dimensions of the screen",
  {},
  async () => {
    try {
      const { width, height } = await tools.getScreenSize();
      return {
        content: [
          {
            type: "text",
            text: `Screen dimensions: ${width}x${height} pixels`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error getting screen size: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Register mouse control tools
server.tool(
  "move_mouse",
  "Move the mouse cursor to a specific position",
  {
    x: z.number().int().min(0).describe("X coordinate in pixels"),
    y: z.number().int().min(0).describe("Y coordinate in pixels"),
  },
  async ({ x, y }) => {
    try {
      const position: Point = { x, y };
      await tools.moveMouse(position);
      return {
        content: [
          {
            type: "text",
            text: `Mouse moved to position: (${x}, ${y})`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error moving mouse: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_mouse_position",
  "Get the current position of the mouse cursor",
  {},
  async () => {
    try {
      const { x, y } = await tools.getMousePosition();
      return {
        content: [
          {
            type: "text",
            text: `Current mouse position: (${x}, ${y})`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error getting mouse position: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "click_mouse",
  "Click the mouse at the current position",
  {
    button: z.enum([MouseButton.LEFT, MouseButton.MIDDLE, MouseButton.RIGHT]).optional().describe("Mouse button to click"),
  },
  async ({ button }) => {
    try {
      await tools.clickMouse(button);
      return {
        content: [
          {
            type: "text",
            text: `Mouse clicked with ${button || MouseButton.LEFT} button`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error clicking mouse: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "click_at",
  "Click the mouse at a specific position",
  {
    x: z.number().int().min(0).describe("X coordinate in pixels"),
    y: z.number().int().min(0).describe("Y coordinate in pixels"),
    button: z.enum([MouseButton.LEFT, MouseButton.MIDDLE, MouseButton.RIGHT]).optional().describe("Mouse button to click"),
  },
  async ({ x, y, button }) => {
    try {
      const position: Point = { x, y };
      await tools.clickMouseAt(position, button);
      return {
        content: [
          {
            type: "text",
            text: `Mouse clicked at position (${x}, ${y}) with ${button || MouseButton.LEFT} button`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error clicking mouse at position: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "double_click",
  "Double-click the mouse at the current position",
  {},
  async () => {
    try {
      await tools.doubleClick();
      return {
        content: [
          {
            type: "text",
            text: "Mouse double-clicked",
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error double-clicking mouse: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "double_click_at",
  "Double-click the mouse at a specific position",
  {
    x: z.number().int().min(0).describe("X coordinate in pixels"),
    y: z.number().int().min(0).describe("Y coordinate in pixels"),
  },
  async ({ x, y }) => {
    try {
      const position: Point = { x, y };
      await tools.doubleClickAt(position);
      return {
        content: [
          {
            type: "text",
            text: `Mouse double-clicked at position (${x}, ${y})`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error double-clicking mouse at position: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "scroll_mouse",
  "Scroll the mouse wheel",
  {
    direction: z.enum([ScrollDirection.UP, ScrollDirection.DOWN]).describe("Direction to scroll"),
    amount: z.number().int().min(1).max(10).optional().describe("Amount to scroll (number of clicks)"),
  },
  async ({ direction, amount }) => {
    try {
      await tools.scrollMouse(direction, amount);
      return {
        content: [
          {
            type: "text",
            text: `Mouse scrolled ${direction} by ${amount || 1} clicks`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error scrolling mouse: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "drag_mouse",
  "Drag the mouse from current position to target position",
  {
    x: z.number().int().min(0).describe("Target X coordinate in pixels"),
    y: z.number().int().min(0).describe("Target Y coordinate in pixels"),
  },
  async ({ x, y }) => {
    try {
      const target: Point = { x, y };
      await tools.dragMouse(target);
      return {
        content: [
          {
            type: "text",
            text: `Mouse dragged to position (${x}, ${y})`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error dragging mouse: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "drag_mouse_from_to",
  "Drag the mouse from start position to end position",
  {
    startX: z.number().int().min(0).describe("Start X coordinate in pixels"),
    startY: z.number().int().min(0).describe("Start Y coordinate in pixels"),
    endX: z.number().int().min(0).describe("End X coordinate in pixels"),
    endY: z.number().int().min(0).describe("End Y coordinate in pixels"),
  },
  async ({ startX, startY, endX, endY }) => {
    try {
      const start: Point = { x: startX, y: startY };
      const end: Point = { x: endX, y: endY };
      await tools.dragMouseFromTo(start, end);
      return {
        content: [
          {
            type: "text",
            text: `Mouse dragged from position (${startX}, ${startY}) to (${endX}, ${endY})`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error dragging mouse: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Register keyboard control tools
server.tool(
  "type_text",
  "Type text at the current cursor position",
  {
    text: z.string().min(1).describe("The text to type"),
  },
  async ({ text }) => {
    try {
      await tools.typeText(text);
      return {
        content: [
          {
            type: "text",
            text: `Typed: ${text}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error typing text: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "type_text_with_delay",
  "Type text with a delay between keystrokes",
  {
    text: z.string().min(1).describe("The text to type"),
    delayMs: z.number().int().min(10).max(1000).optional().describe("Delay between keystrokes in milliseconds"),
  },
  async ({ text, delayMs }) => {
    try {
      await tools.typeTextWithDelay(text, delayMs);
      return {
        content: [
          {
            type: "text",
            text: `Typed with delay: ${text}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error typing text with delay: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "press_key",
  "Press a keyboard key",
  {
    key: z.nativeEnum(Key).describe("The key to press"),
  },
  async ({ key }) => {
    try {
      await tools.pressKey(key);
      return {
        content: [
          {
            type: "text",
            text: `Pressed key: ${key}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error pressing key: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "press_key_shortcut",
  "Press a keyboard shortcut (combination of keys)",
  {
    keys: z.array(z.nativeEnum(Key)).min(1).max(5).describe("Array of keys to press simultaneously"),
  },
  async ({ keys }) => {
    try {
      await tools.pressKeyShortcut(keys);
      return {
        content: [
          {
            type: "text",
            text: `Pressed key shortcut: ${keys.join(" + ")}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error pressing key shortcut: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "hold_key",
  "Hold down a keyboard key",
  {
    key: z.nativeEnum(Key).describe("The key to hold down"),
  },
  async ({ key }) => {
    try {
      await tools.holdKey(key);
      return {
        content: [
          {
            type: "text",
            text: `Holding key: ${key}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error holding key: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "release_key",
  "Release a held keyboard key",
  {
    key: z.nativeEnum(Key).describe("The key to release"),
  },
  async ({ key }) => {
    try {
      await tools.releaseKey(key);
      return {
        content: [
          {
            type: "text",
            text: `Released key: ${key}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error releasing key: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Register clipboard tools
server.tool(
  "get_clipboard_text",
  "Get text from the clipboard",
  {},
  async () => {
    try {
      const text = await tools.getClipboardText();
      return {
        content: [
          {
            type: "text",
            text: `Clipboard content: ${text}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error getting clipboard text: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "set_clipboard_text",
  "Set text to the clipboard",
  {
    text: z.string().describe("The text to set to the clipboard"),
  },
  async ({ text }) => {
    try {
      await tools.setClipboardText(text);
      return {
        content: [
          {
            type: "text",
            text: "Text set to clipboard successfully",
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error setting clipboard text: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "copy_selected_text",
  "Copy selected text to clipboard and return it",
  {},
  async () => {
    try {
      const text = await tools.copySelectedText();
      return {
        content: [
          {
            type: "text",
            text: `Copied text: ${text}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error copying selected text: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "paste_text",
  "Paste text at current cursor position",
  {
    text: z.string().describe("The text to paste"),
  },
  async ({ text }) => {
    try {
      await tools.pasteText(text);
      return {
        content: [
          {
            type: "text",
            text: "Text pasted successfully",
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error pasting text: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get_clipboard_image",
  "Get image from the clipboard (if available) as base64 data",
  {}, // No input parameters needed
  async () => {
    try {
      const base64Image = await tools.getClipboardImage();
      if (base64Image) {
        return {
          content: [
            {
              type: "text",
              text: `Clipboard image retrieved successfully. Image data: ${base64Image}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: "No image found on the clipboard.",
            },
          ],
        };
      }
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error getting clipboard image: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
          },
        ],
      };
    }
  }
);

// Register UI Automation tools
// Note: These tools execute PowerShell scripts using .NET UI Automation
server.tool(
  tools.getUiElementInfoTool.name,
  tools.getUiElementInfoTool.description,
  // Define schema inline using Zod types
  {
    windowTitle: z.string().min(1, 'Window title must be provided'),
    elementName: z.string().optional(),
    automationId: z.string().optional(),
    className: z.string().optional(),
    // Note: Refinement for requiring at least one identifier is handled by the PS script
  },
  async (input: GetUiElementInfoInput) => {
    try {
      // Call the execute function from the imported tool object
      const resultJson = await tools.getUiElementInfoTool.execute(input);
      return {
        content: [{ type: "text", text: resultJson }],
      };
    } catch (error: unknown) { // Add type annotation
      // Handle McpError specifically if thrown by the tool's execute
      if (error instanceof McpError) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error getting UI element info: ${error.message}` }],
        };
      }
      // Handle generic errors
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unexpected error getting UI element info: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  tools.invokeUiElementActionTool.name,
  tools.invokeUiElementActionTool.description,
  // Define schema inline using Zod types
  {
    windowTitle: z.string().min(1, 'Window title must be provided'),
    action: z.enum(['Click', 'SetValue', 'Focus']),
    elementName: z.string().optional(),
    automationId: z.string().optional(),
    className: z.string().optional(),
    valueToSet: z.string().optional(),
    // Note: Refinements for identifier and valueToSet are handled by the PS script
  },
  async (input: InvokeUiElementActionInput) => {
    try {
      // Call the execute function from the imported tool object
      const resultMessage = await tools.invokeUiElementActionTool.execute(input);
      return {
        content: [{ type: "text", text: resultMessage }],
      };
    } catch (error: unknown) { // Add type annotation
      // Handle McpError specifically
      if (error instanceof McpError) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error invoking UI element action: ${error.message}` }],
        };
      }
      // Handle generic errors
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unexpected error invoking UI element action: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);


// Run the server
async function main() {
  try {
    console.error("Starting Total PC Control MCP server...");

    // Initialize nut.js settings
    // screen settings go here if needed

    // Create transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    console.error("Total PC Control MCP server running");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
