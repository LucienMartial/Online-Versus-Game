import { Container, DisplayObject } from "pixi.js";
import { RenderObject } from "./renderer";
import { InputManager } from "./utils/input";

/**
 * Abstract scene
 */
abstract class Scene {
  elapsed = 0;
  renderables: Set<RenderObject>;
  stage: Container<DisplayObject>;
  inputManager: InputManager;

  constructor() {
    this.elapsed = 0;
    this.stage = new Container();
    this.stage.sortableChildren = true;
    this.inputManager = new InputManager();
    this.renderables = new Set<RenderObject>();
  }

  // clean up the scene
  destroy() {
    this.stage.destroy();
  }

  // load asset and create game objects
  abstract load(): Promise<void>;

  update(dt: number): void {
    this.elapsed += dt;
  }

  updateRenderables(dt: number) {
    for (const object of this.renderables.values()) {
      object.update(dt);
    }
  }

  // useful functions
  add(object: RenderObject) {
    object.update(0);
    this.renderables.add(object);
    this.stage.addChild(object.displayObject);
  }

  remove(object: RenderObject) {
    this.renderables.delete(object);
  }

  removeById(id: string) {
    for (const object of this.renderables.values()) {
      if (object.id === id) {
        this.renderables.delete(object);
        this.stage.removeChild(object.displayObject);
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
