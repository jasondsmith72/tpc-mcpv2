import { screen, Region as NutRegion } from "@nut-tree-fork/nut-js";
import sharp from "sharp"; // Import sharp for image processing
import { CaptureFormat, Region as CustomRegion } from "../types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import * as os from "os";
import { randomBytes } from "crypto"; // For unique temp filenames

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Counter for rotating screenshots
let screenshotCounter = 0;
const MAX_SCREENSHOTS = 20;

// Removed SCREENSHOTS_DIR and ensureScreenshotDir

/**
 * Captures the entire screen and returns the image as a base64 string
 * @param format - The format for the image data (png or jpeg)
 * @param quality - JPEG quality (1-100, optional, defaults to 80)
 * @returns Base64 encoded image data with filename context
 */
export async function captureScreen(format: CaptureFormat = CaptureFormat.PNG, quality: number = 80): Promise<string> {
  let tempFilepath = ""; // Path for temporary nut-js capture
  let finalFilepath = ""; // Path for the final (potentially compressed) file saved in CWD
  try {
    // Generate a rotating filename in the project root for the final output
    screenshotCounter = (screenshotCounter % MAX_SCREENSHOTS) + 1;
    const finalFilename = `screenshot_${String(screenshotCounter).padStart(2, '0')}.${format}`;
    finalFilepath = path.resolve(finalFilename); // Final file saved in CWD

    // Generate a unique temporary filename for nut-js capture in the CWD
    const tempFilename = `temp_screenshot_${randomBytes(8).toString('hex')}.png`; // Always capture as PNG initially
    tempFilepath = path.resolve(tempFilename); // Use CWD for the temporary file

    // Capture the screen using nut-js to the temporary PNG file
    const width = await screen.width();
    const height = await screen.height();
    const fullScreenRegion = new NutRegion(0, 0, width, height);
    // Add logging around the capture
    console.error(`Attempting to capture screen to temporary file: ${tempFilepath}`);
    await screen.captureRegion(tempFilepath, fullScreenRegion);
    console.error(`Screen capture command executed for: ${tempFilepath}`);

    // Check if the temporary file was actually created
    try {
      await fs.access(tempFilepath);
      console.error(`Temporary file found: ${tempFilepath}`);
    } catch (accessError) {
      console.error(`Temporary file NOT found after capture attempt: ${tempFilepath}`);
      throw new Error(`nut-js failed to create the temporary screenshot file at ${tempFilepath}`);
    }

    let imageBuffer: Buffer;
    let resultMessage: string;

    if (format === CaptureFormat.JPEG) {
      // Use sharp to read the temp PNG, compress to JPEG, and get the buffer
      imageBuffer = await sharp(tempFilepath)
        .jpeg({ quality: Math.max(1, Math.min(100, quality)) }) // Ensure quality is between 1-100
        .toBuffer();
      // Save the compressed JPEG to the final path in CWD
      await fs.writeFile(finalFilepath, imageBuffer);
      resultMessage = `File saved as ${finalFilename} (JPEG quality: ${quality}). Image data: data:image/jpeg;base64,`;
    } else {
      // For PNG, just read the captured file
      imageBuffer = await fs.readFile(tempFilepath);
      // Save the PNG to the final path in CWD
      await fs.writeFile(finalFilepath, imageBuffer);
      resultMessage = `File saved as ${finalFilename}. Image data: data:image/png;base64,`;
    }

    // Convert final buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Clean up the temporary file
    await fs.unlink(tempFilepath);

    // Return the base64 image along with the filename context
    return `${resultMessage}${base64Image}`;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error capturing screen:", error);
    // Attempt cleanup for both temp and final files if they were set
    if (tempFilepath) {
      try { await fs.unlink(tempFilepath); } catch (cleanupError) { /* Ignore */ }
    }
    // Don't delete finalFilepath as it might be useful for debugging or was the intended output
    // if (finalFilepath) {
    //   try { await fs.unlink(finalFilepath); } catch (cleanupError) { /* Ignore */ }
    // }
    throw new Error(`Failed to capture screen: ${errorMessage}`);
  }
}

/**
 * Captures a region of the screen and returns the image as a base64 string
 * @param region - The region to capture (left, top, width, height)
 * @param format - The format for the image data (png or jpeg)
 * @param quality - JPEG quality (1-100, optional, defaults to 80)
 * @returns Base64 encoded image data with filename context
 */
export async function captureRegion(region: CustomRegion, format: CaptureFormat = CaptureFormat.PNG, quality: number = 80): Promise<string> {
  let tempFilepath = ""; // Path for temporary nut-js capture
  let finalFilepath = ""; // Path for the final (potentially compressed) file saved in CWD
  try {
    // Generate a rotating filename in the project root for the final output
    screenshotCounter = (screenshotCounter % MAX_SCREENSHOTS) + 1;
    const finalFilename = `screenshot_${String(screenshotCounter).padStart(2, '0')}.${format}`;
    finalFilepath = path.resolve(finalFilename); // Final file saved in CWD

    // Generate a unique temporary filename for nut-js capture in the CWD
    const tempFilename = `temp_screenshot_${randomBytes(8).toString('hex')}.png`; // Always capture as PNG initially
    tempFilepath = path.resolve(tempFilename); // Use CWD for the temporary file

    // Capture the region using nut-js to the temporary PNG file
    const nutRegion = new NutRegion(region.left, region.top, region.width, region.height);
    // Add logging around the capture
    console.error(`Attempting to capture region to temporary file: ${tempFilepath}`);
    await screen.captureRegion(tempFilepath, nutRegion);
    console.error(`Region capture command executed for: ${tempFilepath}`);

    // Check if the temporary file was actually created
    try {
      await fs.access(tempFilepath);
      console.error(`Temporary file found: ${tempFilepath}`);
    } catch (accessError) {
      console.error(`Temporary file NOT found after capture attempt: ${tempFilepath}`);
      throw new Error(`nut-js failed to create the temporary screenshot file at ${tempFilepath}`);
    }
    
    let imageBuffer: Buffer;
    let resultMessage: string;

    if (format === CaptureFormat.JPEG) {
      // Use sharp to read the temp PNG, compress to JPEG, and get the buffer
      imageBuffer = await sharp(tempFilepath)
        .jpeg({ quality: Math.max(1, Math.min(100, quality)) }) // Ensure quality is between 1-100
        .toBuffer();
      // Save the compressed JPEG to the final path in CWD
      await fs.writeFile(finalFilepath, imageBuffer);
      resultMessage = `File saved as ${finalFilename} (JPEG quality: ${quality}). Image data: data:image/jpeg;base64,`;
    } else {
      // For PNG, just read the captured file
      imageBuffer = await fs.readFile(tempFilepath);
      // Save the PNG to the final path in CWD
      await fs.writeFile(finalFilepath, imageBuffer);
      resultMessage = `File saved as ${finalFilename}. Image data: data:image/png;base64,`;
    }

    // Convert final buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Clean up the temporary file
    await fs.unlink(tempFilepath);

    // Return the base64 image along with the filename context
    return `${resultMessage}${base64Image}`;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error capturing region:", error);
    // Attempt cleanup for both temp and final files if they were set
    if (tempFilepath) {
      try { await fs.unlink(tempFilepath); } catch (cleanupError) { /* Ignore */ }
    }
    // Don't delete finalFilepath as it might be useful for debugging or was the intended output
    // if (finalFilepath) {
    //   try { await fs.unlink(finalFilepath); } catch (cleanupError) { /* Ignore */ }
    // }
    throw new Error(`Failed to capture screen region: ${errorMessage}`);
  }
}

/**
 * Gets the screen dimensions
 * @returns The screen dimensions as width and height
 */
export async function getScreenSize(): Promise<{ width: number; height: number }> {
  const width = await screen.width(); // Await the width
  const height = await screen.height(); // Await the height
  return {
    width: width,
    height: height
  };
}
