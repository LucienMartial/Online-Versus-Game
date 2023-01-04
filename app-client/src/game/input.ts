const InputsKeys: { [key: string]: string[] } = {
  left: ["a", "ArrowLeft"],
  right: ["d", "ArrowRight"],
  up: ["w", "ArrowUp"],
  down: ["s", "ArrowDown"],
};

class InputManager {
  inputs: { [key: string]: boolean };

  constructor() {
    this.inputs = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    document.body.onkeydown = this.handleKey.bind(this);
    document.body.onkeyup = this.handleKey.bind(this);
  }

  handleKey(e: KeyboardEvent) {
    const state = e.type == "keydown";

    for (const key in this.inputs) {
      if (InputsKeys[key].includes(e.key)) {
        this.inputs[key] = state;
      }
    }
  }
}

export { InputManager };
