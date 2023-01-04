import { Response } from "sat";
import { Entity } from "./entity";

// Engine parameters
const PHYSIC_RATE = 1 / 60;

/**
 * Temporary game state
 */
class World {
  entities: Set<Entity>;

  constructor() {
    this.entities = new Set<Entity>();
  }
}

/**
 * Arcade physic engine
 */
class PhysicEngine {
  world: World;

  constructor() {
    this.world = new World();
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
    const entities = this.world.entities;

    // update position and velocity
    for (const entity of entities) {
      if (entity.static) continue;
      // apply friction
      entity.velocity.scale(entity.friction.x, entity.friction.y);
      // move
      entity.position.add(entity.velocity.clone().scale(dt));
      entity.collisionShape.setPosition(entity.position);
    }

    // handle collisions
    const response = new Response();
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
}

export { PhysicEngine };
