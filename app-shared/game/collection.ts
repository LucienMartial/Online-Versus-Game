import { Entity } from "./index.js";

type EntityCollection = Record<string, Set<Entity>>;

class CollectionManager {
  private collections: EntityCollection;
  private relations: { [key: string]: Set<string> };

  constructor() {
    this.collections = {};
    this.relations = {};
  }

  // Entity in collection
  add(collectionName: string, entity: Entity): void {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = new Set<Entity>();
    }
    this.collections[collectionName].add(entity);
  }

  remove(collectionName: string, entity: Entity): void {
    this.collections[collectionName].delete(entity);
  }

  get<T extends Entity>(collectionName: string): Set<T> {
    // get all the collection childs
    const entities = new Set<T>();
    for (const childName of this.getChilds(collectionName)) {
      for (const entity of this.collections[childName].values()) {
        entities.add(entity as T);
      }
    }
    // add own entities
    const collection = this.collections[collectionName];
    if (!collection) return entities;
    for (const entity of collection.values()) {
      entities.add(entity as T);
    }
    return entities;
  }

  getById<T extends Entity>(collectionName: string, id: string): T | undefined {
    for (const entity of this.get(collectionName)) {
      if (entity.id === id) return entity as T;
    }
    return undefined;
  }

  // Collection in collection
  addCollections(parentName: string, childNames: string[]): void {
    if (!this.relations[parentName]) {
      this.relations[parentName] = new Set<string>();
    }
    for (const name of childNames) {
      if (!this.collections[name]) continue;
      this.relations[parentName].add(name);
    }
  }

  /**
   * Remove child collection to its parent, do not remove entity
   */
  removeCollection(parentName: string, childName: string): void {
    if (!this.collections[parentName] || !this.collections[childName]) return;
    this.relations[parentName].delete(childName);
  }

  private getChilds(parentName: string): IterableIterator<string> {
    const childs = this.relations[parentName];
    if (!childs) return new Set<string>().values();
    return childs.values();
  }

  /**
   * run update on all entities
   * @param dt
   */
  update(dt: number) {
    for (const [name, collection] of Object.entries(this.collections)) {
      // update collection child's entities
      for (const childName of this.getChilds(name)) {
        for (const entity of this.collections[childName].values()) {
          if (entity.isDead) continue;
          entity.update(dt);
        }
      }
      // update own entity
      for (const entity of collection.values()) {
        if (entity.isDead) continue;
        entity.update(dt);
      }
    }
  }
}

export { CollectionManager };
