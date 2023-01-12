import { Container, DisplayObject } from "pixi.js";
import { RenderObject } from "./renderer";
import { InputManager } from "./utils/input";

/**
 * Abstract scene
 */
abstract class Scene {
  renderables: Set<RenderObject>;
  stage: Container<DisplayObject>;
  inputManager: InputManager;

  constructor() {
    this.stage = new Container();
    this.stage.sortableChildren = true;
    this.inputManager = new InputManager();
    this.renderables = new Set<RenderObject>();
  }

  /**
   * Clean up the scene
   */
  destroy() {
    this.stage.destroy();
  }

  /**
   * Load assets and create game objects
   */
  abstract load(): Promise<void>;

  /**
   * Update logic
   */
  update(dt: number, now: number): void {}

  /**
   * Update renderable objects
   */
  updateRenderables(dt: number, now: number) {
    for (const object of this.renderables.values()) {
      object.update(dt, now);
    }
  }

  // useful functions

  add(object: RenderObject) {
    object.update(0, 0);
    this.renderables.add(object);
    this.stage.addChild(object.container);
  }

  remove(object: RenderObject) {
    this.renderables.delete(object);
  }

  removeById(id: string) {
    for (const object of this.renderables.values()) {
      if (object.id === id) {
        this.renderables.delete(object);
        this.stage.removeChild(object.container);
        return;
      }
    }
  }

  getById(id: string): RenderObject | undefined {
    for (const object of this.renderables.values()) {
      if (object.id === id) return object;
    }
  }
}

export { Scene };
