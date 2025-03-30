/**
 * Types for mouse buttons
 */
export enum MouseButton {
  LEFT = "left",
  MIDDLE = "middle",
  RIGHT = "right"
}

/**
 * Common keyboard keys enum
 */
export enum Key {
  // Basic keys
  BACKSPACE = "backspace",
  TAB = "tab",
  ENTER = "enter",
  SHIFT = "shift",
  CONTROL = "control",
  ALT = "alt",
  PAUSE = "pause",
  CAPSLOCK = "capslock",
  ESCAPE = "escape",
  SPACE = "space",
  PAGEUP = "pageup",
  PAGEDOWN = "pagedown",
  END = "end",
  HOME = "home",
  LEFTARROW = "left",
  UPARROW = "up",
  RIGHTARROW = "right",
  DOWNARROW = "down",
  INSERT = "insert",
  DELETE = "delete",

  // Numbers
  NUM0 = "0",
  NUM1 = "1",
  NUM2 = "2",
  NUM3 = "3",
  NUM4 = "4",
  NUM5 = "5",
  NUM6 = "6",
  NUM7 = "7",
  NUM8 = "8",
  NUM9 = "9",

  // Letters
  A = "a",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
  G = "g",
  H = "h",
  I = "i",
  J = "j",
  K = "k",
  L = "l",
  M = "m",
  N = "n",
  O = "o",
  P = "p",
  Q = "q",
  R = "r",
  S = "s",
  T = "t",
  U = "u",
  V = "v",
  W = "w",
  X = "x",
  Y = "y",
  Z = "z",

  // Function keys
  F1 = "f1",
  F2 = "f2",
  F3 = "f3",
  F4 = "f4",
  F5 = "f5",
  F6 = "f6",
  F7 = "f7",
  F8 = "f8",
  F9 = "f9",
  F10 = "f10",
  F11 = "f11",
  F12 = "f12",

  // Numpad
  NUMPAD0 = "numpad0",
  NUMPAD1 = "numpad1",
  NUMPAD2 = "numpad2",
  NUMPAD3 = "numpad3",
  NUMPAD4 = "numpad4",
  NUMPAD5 = "numpad5",
  NUMPAD6 = "numpad6",
  NUMPAD7 = "numpad7",
  NUMPAD8 = "numpad8",
  NUMPAD9 = "numpad9",
  NUMPADMULTIPLY = "numpadmultiply",
  NUMPADADD = "numpadadd",
  NUMPADSUBTRACT = "numpadsubtract",
  NUMPADDECIMAL = "numpaddecimal",
  NUMPADDIVIDE = "numpaddivide",

  // Other keys
  COMMAND = "command",
  WINDOWS = "windows",
  PRINTSCREEN = "printscreen"
}

/**
 * Direction for scrolling
 */
export enum ScrollDirection {
  UP = "up",
  DOWN = "down"
}

/**
 * Screen capture format
 */
export enum CaptureFormat {
  PNG = "png",
  JPEG = "jpeg"
}

/**
 * Interface for screen point coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Interface for screen region
 */
export interface Region {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Interface for window information
 */
export interface WindowInfo {
  title: string;
  applicationName: string;
  region: Region;
  active: boolean;
}
