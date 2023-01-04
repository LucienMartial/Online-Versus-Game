import {
  Vector,
  Circle,
  Polygon,
  Box,
  testCircleCircle,
  testCirclePolygon,
  testPolygonCircle,
  testPolygonPolygon,
  Response,
} from "sat";
declare module "sat" {
  export interface Circle {
    offset: Vector;
  }
}

/**
 * High level collision shape
 */
enum ShapeType {
  Polygon,
  Circle,
}

/**
 * Dynamic collision table, indexing by pair of collidables
 */
const collisionCallbacks: Function[][] = [
  [testPolygonPolygon, testPolygonCircle],
  [testCirclePolygon, testCircleCircle],
];

/**
 * Possible collision object
 */
type Shape = Polygon | Circle;

/**
 * Base collision object
 */
abstract class CollisionShape {
  type: ShapeType;
  shape: Shape;

  constructor(type: ShapeType) {
    this.type = type;
    this.shape = new Circle();
  }

  setPosition(position: Vector): void {
    this.shape.pos.copy(position);
  }

  setOffset(offset: Vector): void {
    this.shape.offset.copy(offset);
  }

  setRotation(rotation: number): void {}

  /**
   * Dynamic collision based on shape type
   * @param response
   * @param other
   * @returns true if item collided
   */
  collideWith(response: Response, other: CollisionShape): boolean {
    return collisionCallbacks[this.type][other.type](
      this.shape,
      other.shape,
      response
    );
  }
}

/**
 * Box collision shape
 */
class BoxShape extends CollisionShape {
  shape: Polygon;

  constructor(width: number, height: number) {
    super(ShapeType.Polygon);
    this.shape = new Box(new Vector(), width, height).toPolygon();
  }

  setRotation(angle: number): void {
    this.shape.setAngle(angle);
  }

  setOffset(offset: Vector): void {
    super.setOffset(offset);
    this.shape.translate(0, 0);
  }
}

export { CollisionShape, BoxShape };
