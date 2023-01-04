import { Vector, Response } from "sat";
import { CollisionShape } from "./collision";

// Default values
const FRICTION = 0.95;

/**
 * Physic entity, renderless, usable on server and client
 */
class Entity {
  position: Vector;
  velocity: Vector;
  friction: Vector;
  offset: Vector;
  rotation: number;
  static: boolean;
  collisionShape: CollisionShape;

  constructor(collisionShape: CollisionShape, isStatic = true) {
    this.position = new Vector();
    this.velocity = new Vector();
    this.friction = new Vector(FRICTION, FRICTION);
    this.offset = new Vector();
    this.rotation = 0;
    this.static = isStatic;
    this.collisionShape = collisionShape;
  }

  setPosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.collisionShape.setPosition(this.position);
  }

  setOffset(x: number, y: number) {
    this.offset = new Vector(-x, -y);
    this.collisionShape.setOffset(this.offset);
  }

  setRotation(angle: number) {
    this.rotation = angle;
    this.collisionShape.setRotation(angle);
  }

  /**
   * Basic collision response
   */
  onCollision(response: Response, other: Entity) {
    this.position.sub(response.overlapV);
  }
}

export { Entity };
