export * from "./constants.js";
export * from "../types/inputs.js";
export * from "./math.js";
export * from "./cbuffer.js";
export * from "./timer.js";

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
