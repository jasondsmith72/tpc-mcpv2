# Setting up Total PC Control with Claude for Desktop

This guide explains how to configure Claude for Desktop to use the Total PC Control MCP server.

## Prerequisites

1. Ensure you have [Claude for Desktop](https://claude.ai/download) installed.
2. Make sure your Total PC Control server is built and ready to use (follow the instructions in the README.md file).

## Configuration Steps

1. Open or create your Claude for Desktop configuration file:

   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the Total PC Control server to your configuration:

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

   Replace `/ABSOLUTE/PATH/TO/` with the actual path to the repository on your system.

3. Save the configuration file.

4. Restart Claude for Desktop.

## Verifying the Setup

1. Open Claude for Desktop.
2. Look for the hammer icon <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/claude-desktop-mcp-hammer-icon.svg" style="display: inline; margin: 0; height: 1.3em;"> in the bottom of the input area.
3. Click on the hammer icon to see the available tools.
4. You should see the tools provided by Total PC Control in the list.

## Using the Server

You can now ask Claude to perform screen control operations. For example:

- "Can you take a screenshot of my screen?"
- "Please click on the start menu button"
- "Type 'Hello world' in the current application"
- "Move the mouse to coordinates 500, 300 and click there"

Claude will use the Total PC Control server to execute these operations.

## Security Warnings

Remember that this server allows Claude to control your computer through mouse, keyboard, and screen capture operations. Only use it when you need this functionality, and always be careful about what operations you ask Claude to perform.

Claude will always ask for your permission before executing any tool, but you should still verify what it's about to do before approving.

## Troubleshooting

If you encounter issues:

1. Check the Claude logs for errors:
   - **macOS**: `~/Library/Logs/Claude/mcp*.log`
   - **Windows**: `%APPDATA%\Claude\logs\mcp*.log`

2. Ensure the path to your server is correct in the configuration file.

3. Verify that you've built the server correctly by running it manually:
   ```bash
   node /path/to/total-pc-control/build/index.js
   ```

4. Check that you have all required dependencies installed.
