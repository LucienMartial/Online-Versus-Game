import type { Inputs } from "../../../../app-shared/utils";

const InputsKeys: Record<Inputs, string[]> = {
  left: ["q", "a", "ArrowLeft"],
  right: ["d", "ArrowRight"],
  up: ["z", "w", "ArrowUp"],
  down: ["s", "ArrowDown"],
  dash: [" "],
};

class InputManager {
  inputs: Record<Inputs, boolean>;

  constructor() {
    this.inputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      dash: false,
    };

    document.body.onkeydown = this.handleKey.bind(this);
    document.body.onkeyup = this.handleKey.bind(this);
  }

  handleKey(e: KeyboardEvent) {
    const state = e.type == "keydown";

    for (const key in this.inputs) {
      if (InputsKeys[key as Inputs].includes(e.key)) {
        this.inputs[key as Inputs] = state;
      }
    }
  }
}

export { InputManager };
export type { Inputs };
