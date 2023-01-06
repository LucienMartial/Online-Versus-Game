import SAT from "sat";
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
  [SAT.testPolygonPolygon, SAT.testPolygonCircle],
  [SAT.testCirclePolygon, SAT.testCircleCircle],
];

/**
 * Possible collision object
 */
type Shape = SAT.Polygon | SAT.Circle;

/**
 * Base collision object
 */
abstract class CollisionShape {
  type: ShapeType;
  shape: Shape;

  constructor(type: ShapeType) {
    this.type = type;
    this.shape = new SAT.Circle();
  }

  setPosition(position: SAT.Vector): void {
    this.shape.pos.copy(position);
  }

  setOffset(offset: SAT.Vector): void {
    this.shape.offset.x = -offset.x;
    this.shape.offset.y = -offset.y;
  }

  setRotation(rotation: number): void {}

  /**
   * Dynamic collision based on shape type
   * @param response
   * @param other
   * @returns true if item collided
   */
  collideWith(response: SAT.Response, other: CollisionShape): boolean {
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
  shape: SAT.Polygon;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    super(ShapeType.Polygon);
    this.width = width;
    this.height = height;
    this.shape = new SAT.Box(new SAT.Vector(), width, height).toPolygon();
  }

  setRotation(angle: number): void {
    this.shape.setAngle(angle);
  }

  setOffset(offset: SAT.Vector): void {
    super.setOffset(offset);
    this.shape.translate(0, 0);
  }
}

/**
 * Line collision, to have thickness, use Polygon with 4 points
 */
class LineShape extends CollisionShape {
  p1: SAT.Vector;
  p2: SAT.Vector;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    super(ShapeType.Polygon);
    this.p1 = new SAT.Vector(x1, y1);
    this.p2 = new SAT.Vector(x2, y2);
    const points = [this.p1, this.p2];
    this.shape = new SAT.Polygon(new SAT.Vector(), points);
  }
}

export { CollisionShape, BoxShape, LineShape };
