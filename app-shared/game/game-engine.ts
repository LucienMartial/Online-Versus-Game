import { PhysicEngine } from "../physics/index.js";
import { Inputs } from "../utils/index.js";
import { Entity, BodyEntity, CollectionManager } from "./index.js";
import { GAME_RATE } from "../utils/index.js";

/**
 * Contain the game logic, used on server and client
 */
class GameEngine {
  private collections: CollectionManager;
  physicEngine: PhysicEngine;
  accumulator: number;

  constructor() {
    this.physicEngine = new PhysicEngine();
    this.collections = new CollectionManager();
    this.accumulator = 0;
    this.init();
  }

  init() {}

  processInput(now: number, inputs: Record<Inputs, boolean>, id: string) {}

  processInputBuffer(
    now: number,
    inputs: Record<Inputs, boolean>[],
    id: string
  ) {
    for (const input of inputs) {
      this.processInput(now, input, id);
    }
  }

  fixedUpdate(dt: number, now: number) {
    this.accumulator += Math.max(dt, GAME_RATE);
    while (this.accumulator >= GAME_RATE) {
      this.step(GAME_RATE, now);
      this.accumulator -= GAME_RATE;
      now += GAME_RATE;
    }
  }

  step(dt: number, now: number) {
    this.collections.update(dt, now);
    this.physicEngine.step(dt);
  }

  /**
   * Add, remove, get entities collection
   */

  add(collectionName = "default", entity: Entity) {
    this.collections.add(collectionName, entity);
    if (entity instanceof BodyEntity) {
      this.physicEngine.add(entity);
    }
  }

  get<T extends Entity>(collectionName = "default"): Set<T> {
    return this.collections.get<T>(collectionName);
  }

  getById<T extends Entity>(
    collectionName = "default",
    id: string
  ): T | undefined {
    return this.collections.getById<T>(collectionName, id);
  }

  remove(collectionName: string, entity: Entity) {
    this.collections.remove(collectionName, entity);
    if (entity instanceof BodyEntity) {
      this.physicEngine.remove(entity);
    }
  }

  removeById(collectionName: string, id: string) {
    const entity = this.getById(collectionName, id);
    if (!entity) return;
    this.remove(collectionName, entity);
  }

  addCollections(collectionName: string, childNames: string[]) {
    this.collections.addCollections(collectionName, childNames);
  }

  removeCollection(collectionName: string, childName: string) {
    this.collections.removeCollection(collectionName, childName);
  }
}

export { GameEngine };
