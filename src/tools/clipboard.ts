import { clipboard } from "@nut-tree/nut-js";
import { copyToClipboard, pasteFromClipboard } from "./keyboard.js";

/**
 * Gets text from the clipboard
 * @returns The text content from the clipboard
 */
export async function getClipboardText(): Promise<string> {
  try {
    return await clipboard.getContent();
  } catch (error) {
    console.error("Error getting clipboard text:", error);
    throw new Error("Failed to get clipboard text");
  }
}

/**
 * Sets text to the clipboard
 * @param text - The text to set to the clipboard
 */
export async function setClipboardText(text: string): Promise<void> {
  try {
    await clipboard.setContent(text);
  } catch (error) {
    console.error("Error setting clipboard text:", error);
    throw new Error("Failed to set clipboard text");
  }
}

/**
 * Copies selected text to clipboard using keyboard shortcut
 * then returns the clipboard content
 * @returns The text that was copied to the clipboard
 */
export async function copySelectedText(): Promise<string> {
  try {
    // Execute copy keyboard shortcut
    await copyToClipboard();
    
    // Small delay to ensure the clipboard has been updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get clipboard content
    return await getClipboardText();
  } catch (error) {
    console.error("Error copying selected text:", error);
    throw new Error("Failed to copy selected text");
  }
}

/**
 * Pastes text from clipboard using keyboard shortcut
 */
export async function pasteClipboardText(): Promise<void> {
  try {
    await pasteFromClipboard();
  } catch (error) {
    console.error("Error pasting clipboard text:", error);
    throw new Error("Failed to paste clipboard text");
  }
}

/**
 * Sets text to clipboard then pastes it at current cursor position
 * @param text - The text to paste
 */
export async function pasteText(text: string): Promise<void> {
  try {
    // Set the text to the clipboard
    await setClipboardText(text);
    
    // Small delay to ensure the clipboard has been updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Paste the text
    await pasteClipboardText();
  } catch (error) {
    console.error("Error pasting text:", error);
    throw new Error("Failed to paste text");
  }
}
