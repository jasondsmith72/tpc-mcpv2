import { screen } from "@nut-tree/nut-js";
import { CaptureFormat, Region } from "../types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import * as os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory for storing screenshots
const SCREENSHOTS_DIR = path.join(os.tmpdir(), "total-pc-control", "screenshots");

/**
 * Ensures that the screenshots directory exists
 */
export async function ensureScreenshotDir(): Promise<void> {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating screenshots directory:", error);
    throw new Error("Failed to create screenshots directory");
  }
}

/**
 * Captures the entire screen and returns the image as a base64 string
 * @param format - The format to save the image in (png or jpeg)
 * @returns Base64 encoded image data
 */
export async function captureScreen(format: CaptureFormat = CaptureFormat.PNG): Promise<string> {
  try {
    await ensureScreenshotDir();
    
    // Generate a filename with timestamp
    const timestamp = Date.now();
    const filename = `screenshot_${timestamp}.${format}`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    // Capture the screen
    await screen.captureRegion(filepath, screen.width, screen.height, 0, 0);
    
    // Read the file and convert to base64
    const imageBuffer = await fs.readFile(filepath);
    const base64Image = imageBuffer.toString("base64");
    
    // Clean up the file
    await fs.unlink(filepath);
    
    return base64Image;
  } catch (error) {
    console.error("Error capturing screen:", error);
    throw new Error("Failed to capture screen");
  }
}

/**
 * Captures a region of the screen and returns the image as a base64 string
 * @param region - The region to capture (left, top, width, height)
 * @param format - The format to save the image in (png or jpeg)
 * @returns Base64 encoded image data
 */
export async function captureRegion(region: Region, format: CaptureFormat = CaptureFormat.PNG): Promise<string> {
  try {
    await ensureScreenshotDir();
    
    // Generate a filename with timestamp
    const timestamp = Date.now();
    const filename = `region_${timestamp}.${format}`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    // Capture the region
    await screen.captureRegion(filepath, region.width, region.height, region.left, region.top);
    
    // Read the file and convert to base64
    const imageBuffer = await fs.readFile(filepath);
    const base64Image = imageBuffer.toString("base64");
    
    // Clean up the file
    await fs.unlink(filepath);
    
    return base64Image;
  } catch (error) {
    console.error("Error capturing region:", error);
    throw new Error("Failed to capture screen region");
  }
}

/**
 * Gets the screen dimensions
 * @returns The screen dimensions as width and height
 */
export async function getScreenSize(): Promise<{ width: number; height: number }> {
  return {
    width: screen.width,
    height: screen.height
  };
}
