import { Container, DisplayObject } from "pixi.js";
import { Vector } from "sat";
import {
  CollisionShape,
  Entity,
  PhysicEngine,
} from "../../../app-shared/physics";
import { InputManager } from "./input";

/**
 * Context object containing scene data
 */
class Context {
  stage: Container<DisplayObject>;
  physicEngine: PhysicEngine;
  inputManager: InputManager;
  width: number;
  height: number;

  constructor(
    stage: Container<DisplayObject>,
    physicEngine: PhysicEngine,
    inputManager: InputManager,
    width: number,
    height: number
  ) {
    this.stage = stage;
    this.physicEngine = physicEngine;
    this.inputManager = inputManager;
    this.width = width;
    this.height = height;
  }
}

/**
 * Basic game object
 */
abstract class GameObject {
  private _position: Vector;
  ctx: Context;
  onUpdate?: { (dt: number): void };

  constructor(ctx: Context) {
    this._position = new Vector();
    this.ctx = ctx;
    this.onUpdate = undefined;
  }

  update(dt: number): void {
    this.onUpdate?.(dt);
  }

  abstract render(): void;

  // getters, setters
  setPosition(x: number, y: number) {
    this._position = new Vector(x, y);
  }

  move(x: number, y: number) {
    this._position.add(new Vector(x, y));
  }

  get position(): Vector {
    return this._position;
  }
}

/**
 * Renderable game object
 */
class RenderObject extends GameObject {
  displayObject: DisplayObject;
  private rotation: number;

  constructor(ctx: Context, displayObject: DisplayObject) {
    super(ctx);
    this.displayObject = displayObject;
    this.rotation = 0;
  }

  update(dt: number) {
    super.update(dt);
  }

  render() {
    this.displayObject.position.set(this.position.x, this.position.y);
    this.displayObject.rotation = this.rotation;
    this.ctx.stage.addChild(this.displayObject);
  }

  // getters, setters
  setOffset(x: number, y: number): void {
    this.displayObject.pivot.set(x, y);
  }

  setRotation(angle: number) {
    this.rotation = angle;
  }

  rotate(angle: number) {
    this.rotation += angle;
  }
}

/**
 * Renderable game object with collision body
 */
class CollisionObject extends RenderObject {
  physicObject: Entity;

  constructor(
    ctx: Context,
    displayObject: DisplayObject,
    collisionShape: CollisionShape,
    isStatic = false
  ) {
    super(ctx, displayObject);
    this.physicObject = new Entity(collisionShape, isStatic);
    this.physicObject.setPosition(this.position.x, this.position.y);
    this.ctx.physicEngine.world.entities.add(this.physicObject);
    this.ctx.stage.addChild(this.displayObject);
  }

  update(dt: number) {
    super.update(dt);
    this.setPosition(
      this.physicObject.position.x,
      this.physicObject.position.y
    );
  }

  // getters, setters
  setPosition(x: number, y: number): void {
    super.setPosition(x, y);
    this.physicObject.setPosition(x, y);
  }

  setRotation(angle: number) {
    super.setRotation(angle);
    this.physicObject.setRotation(angle);
  }

  setOffset(x: number, y: number): void {
    super.setOffset(x, y);
    this.physicObject.setOffset(x, y);
  }

  move(x: number, y: number) {
    super.move(x, y);
    this.physicObject.setPosition(x, y);
  }

  accelerate(x: number, y: number) {
    this.physicObject.velocity.x += x;
    this.physicObject.velocity.y += y;
  }

  rotate(angle: number): void {
    super.rotate(angle);
    this.physicObject.setRotation(this.physicObject.rotation + angle);
  }
}

export { Context, GameObject, RenderObject, CollisionObject };
