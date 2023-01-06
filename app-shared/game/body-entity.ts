import SAT from "sat";
import { Entity } from "./index.js";
import { CollisionShape } from "../physics/index.js";

// Default values
const FRICTION = 0.95;
const MAX_SPEED = 2000;

/**
 * Entity with collision body
 */
class BodyEntity extends Entity {
  velocity: SAT.Vector;
  friction: SAT.Vector;
  maxSpeed: number;
  offset: SAT.Vector;
  rotation: number;
  static: boolean;
  collisionShape: CollisionShape;

  constructor(collisionShape: CollisionShape, isStatic = true, id = "") {
    super(id);
    this.velocity = new SAT.Vector();
    this.friction = new SAT.Vector(FRICTION, FRICTION);
    this.offset = new SAT.Vector();
    this.rotation = 0;
    this.maxSpeed = MAX_SPEED;
    this.static = isStatic;
    this.collisionShape = collisionShape;
  }

  update(dt: number) {
    super.update(dt);
  }

  /**
   * Basic collision response
   */
  onCollision(response: SAT.Response, other: BodyEntity) {}

  // getters, setters

  setPosition(x: number, y: number) {
    super.setPosition(x, y);
    this.collisionShape.setPosition(this.position);
  }

  setRotation(angle: number) {
    this.rotation = angle;
    this.collisionShape.setRotation(angle);
  }

  setOffset(x: number, y: number) {
    this.offset = new SAT.Vector(x, y);
    this.collisionShape.setOffset(this.offset);
  }

  move(x: number, y: number) {
    super.move(x, y);
    this.collisionShape.setPosition(this.position);
  }

  accelerate(x: number, y: number) {
    this.velocity.x += x;
    this.velocity.y += y;
  }

  rotate(angle: number): void {
    this.setRotation(this.rotation + angle);
  }
}

export { BodyEntity };
