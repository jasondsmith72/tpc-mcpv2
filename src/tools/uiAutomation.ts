// Remove Tool and ToolInputParsingResult imports as they conflict with server.tool usage
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve path to the PowerShell scripts relative to the current file's directory
const getInfoScriptPath = path.resolve(__dirname, '../../GetUIElementInfo.ps1');
const invokeActionScriptPath = path.resolve(__dirname, '../../InvokeUIElementAction.ps1');


// --- Get UI Element Info Tool ---

const GetUiElementInfoInputSchema = z.object({
  windowTitle: z.string().min(1, 'Window title must be provided'),
  elementName: z.string().optional(),
  automationId: z.string().optional(),
  className: z.string().optional(),
}); // Remove .refine()

 export type GetUiElementInfoInput = z.infer<typeof GetUiElementInfoInputSchema>; // Keep export

 // Define tool object with properties needed by src/index.ts server.tool()
 export const getUiElementInfoTool = {
  name: 'get_ui_element_info',
  description: 'Finds a UI element within a specified window using UI Automation and returns its properties (Name, AutomationId, ClassName, ControlType, BoundingRectangle, IsEnabled, IsOffscreen, Value). Requires window title and at least one element identifier (name, automationId, or className).',
  inputSchema: GetUiElementInfoInputSchema, // Provide the Zod schema here

  execute: async (input: GetUiElementInfoInput): Promise<string> => {
    // Execution logic remains the same
    return new Promise((resolve, reject) => {
      const args = [
        '-ExecutionPolicy', 'Bypass', // Ensure script can run
        '-File', getInfoScriptPath,
        '-WindowTitle', input.windowTitle,
      ];
      if (input.elementName) args.push('-ElementName', input.elementName);
      if (input.automationId) args.push('-AutomationId', input.automationId);
      if (input.className) args.push('-ClassName', input.className);

      const ps = spawn('powershell.exe', args);

      let stdoutData = '';
      let stderrData = '';

      ps.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      ps.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      ps.on('close', (code) => {
        if (code === 0) {
          // Attempt to parse the JSON output
          try {
            // Trim whitespace/newlines before parsing
            const trimmedOutput = stdoutData.trim();
            // Basic check if it looks like JSON before parsing
            if (trimmedOutput.startsWith('{') && trimmedOutput.endsWith('}')) {
               JSON.parse(trimmedOutput); // Validate JSON structure
               resolve(trimmedOutput); // Return the valid JSON string
            } else if (trimmedOutput) {
                // If it's not JSON but not empty, return it as plain text (might be a success message)
                resolve(`Script executed successfully, but output was not valid JSON:\n${trimmedOutput}`);
            }
             else {
                 resolve('Script executed successfully with no JSON output.'); // Handle cases with no output on success
             }
           } catch (parseError: unknown) { // Explicitly type parseError
             console.error("Raw stdout:", stdoutData); // Log raw output for debugging
             const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
             reject(new McpError(ErrorCode.InternalError, `Script succeeded but failed to parse JSON output: ${errorMessage}\nOutput:\n${stdoutData}`));
           }
         } else {
           console.error("PowerShell Error Output:", stderrData); // Log stderr for debugging
           // Prioritize stderr for error message if available
           const errorMessage = stderrData.trim() || stdoutData.trim() || `PowerShell script exited with code ${code}`;
           reject(new McpError(ErrorCode.InternalError, `Failed to get UI element info: ${errorMessage}`)); // Use InternalError
         }
       });

        ps.on('error', (err) => {
          reject(new McpError(ErrorCode.InternalError, `Failed to start PowerShell process: ${err.message}`)); // Use InternalError
        });
     });
  },
 };

 // --- Invoke UI Element Action Tool ---

 const InvokeUiElementActionInputSchema = z.object({
   windowTitle: z.string().min(1, 'Window title must be provided'),
   action: z.enum(['Click', 'SetValue', 'Focus']),
   elementName: z.string().optional(),
   automationId: z.string().optional(),
  className: z.string().optional(),
  valueToSet: z.string().optional(), // Only used for 'SetValue' action
 }); // Remove .refine() calls

 export type InvokeUiElementActionInput = z.infer<typeof InvokeUiElementActionInputSchema>; // Keep export

 // Define tool object with properties needed by src/index.ts server.tool()
 export const invokeUiElementActionTool = {
    name: 'invoke_ui_element_action',
    description: 'Performs an action (Click, SetValue, Focus) on a specified UI element found via UI Automation. Requires window title, action, and at least one element identifier. Requires valueToSet for the SetValue action.',
    inputSchema: InvokeUiElementActionInputSchema, // Provide the Zod schema here

    execute: async (input: InvokeUiElementActionInput): Promise<string> => {
        // Execution logic remains the same
        return new Promise((resolve, reject) => {
        const args = [
            '-ExecutionPolicy', 'Bypass',
            '-File', invokeActionScriptPath,
            '-WindowTitle', input.windowTitle,
            '-Action', input.action,
        ];
        if (input.elementName) args.push('-ElementName', input.elementName);
        if (input.automationId) args.push('-AutomationId', input.automationId);
        if (input.className) args.push('-ClassName', input.className);
        if (input.action === 'SetValue' && input.valueToSet !== undefined) {
            args.push('-ValueToSet', input.valueToSet);
        }

        const ps = spawn('powershell.exe', args);

        let stdoutData = '';
        let stderrData = '';

        ps.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        ps.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        ps.on('close', (code) => {
            if (code === 0) {
            // Success messages are usually written to stdout by the script
            resolve(stdoutData.trim() || 'Action completed successfully.');
            } else {
            console.error("PowerShell Error Output:", stderrData);
            const errorMessage = stderrData.trim() || stdoutData.trim() || `PowerShell script exited with code ${code}`;
            reject(new McpError(ErrorCode.InternalError, `Failed to invoke UI element action: ${errorMessage}`));
            }
        });

         ps.on('error', (err) => {
           reject(new McpError(ErrorCode.InternalError, `Failed to start PowerShell process: ${err.message}`));
         });
        });
    },
 };

 // Export the tool objects directly
 export const uiAutomationTools = [
     getUiElementInfoTool,
     invokeUiElementActionTool
 ];
