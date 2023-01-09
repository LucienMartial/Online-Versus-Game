import SAT from "sat";
import { BodyEntity } from "../game/index.js";

// Engine parameters
const PHYSIC_RATE = 1 / 60;

/**
 * Arcade physic engine
 */
class PhysicEngine {
  private _world: Set<BodyEntity>;

  constructor() {
    this._world = new Set<BodyEntity>();
  }

  /**
   * Run the simulation at a fixed rate respecting delta time,
   * if needed, simulate multiple steps
   * @param dt
   */
  fixedUpdate(dt: number): void {
    while (dt > 0) {
      const stepTime = Math.min(dt, PHYSIC_RATE);
      this.step(PHYSIC_RATE);
      dt -= stepTime;
    }
  }

  /**
   * Run 1 step of simulation
   * @param dt
   */
  step(dt: number) {
    const entities = this._world;

    // update position and velocity
    for (const entity of entities) {
      if (entity.static) continue;
      // magnitude
      const magnitude = entity.velocity.len();
      if (magnitude > entity.maxSpeed) {
        entity.velocity.scale(entity.maxSpeed / magnitude);
      }
      // move
      entity.position.add(entity.velocity.clone().scale(dt));
      entity.collisionShape.setPosition(entity.position);
      // apply friction
      entity.velocity.scale(entity.friction.x, entity.friction.y);
    }

    // handle collisions
    const response = new SAT.Response();
    for (const entity of entities) {
      if (entity.static) continue;
      for (const collidable of entities) {
        if (collidable === entity) continue;

        // check collision
        response.clear();
        const collided = entity.collisionShape.collideWith(
          response,
          collidable.collisionShape
        );

        // resolve collision
        if (collided) {
          entity.onCollision(response, collidable);
          entity.collisionShape.setPosition(entity.position);
        }
      }
    }
  }

  // getters, setters
  add(entity: BodyEntity) {
    this._world.add(entity);
  }

  remove(entity: BodyEntity) {
    this._world.delete(entity);
  }

  get world(): Set<BodyEntity> {
    return this._world;
  }
}

export { PhysicEngine };
