export type Inputs = "left" | "right" | "up" | "down" | "dash";
export interface InputData {
  time: number;
  inputs: Record<Inputs, boolean>;
}
