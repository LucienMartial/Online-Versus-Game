import { DisplayObject } from "pixi.js";
import { CollisionShape, Entity } from "../../../app-shared/physics";

/**
 * Game object, contain rendering and physic informations
 */
class gameObject extends Entity {
  displayObject: DisplayObject;

  constructor(
    displayObject: DisplayObject,
    collisionShape: CollisionShape,
    isStatic = true
  ) {
    super(collisionShape, isStatic);
    this.displayObject = displayObject;
  }

  setPosition(x: number, y: number): void {
    super.setPosition(x, y);
    this.render();
  }

  setRotation(angle: number): void {
    super.setRotation(angle);
    this.render();
  }

  setOffset(x: number, y: number): void {
    super.setOffset(x, y);
    this.displayObject.pivot.set(x, y);
  }

  /**
   * Update the display object position
   */
  render(): void {
    this.displayObject.position.set(this.position.x, this.position.y);
    this.displayObject.rotation = this.rotation;
  }
}

export { gameObject };
