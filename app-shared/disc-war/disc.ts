import SAT from "sat";
import { BodyEntity } from "../game/body-entity.js";
import { CircleShape } from "../physics/collision.js";
import { MIDDLE_LINE_ID } from "../utils/constants.js";

const FRICTION = 1;
const RADIUS = 50;
const MAX_SPEED = 3000;

class Disc extends BodyEntity {
  constructor() {
    // default
    const collisionShape = new CircleShape(RADIUS);
    super(collisionShape, false);

    // custom
    this.friction = new SAT.Vector(FRICTION, FRICTION);
    this.maxSpeed = MAX_SPEED;
  }

  onCollision(response: SAT.Response, other: BodyEntity): void {
    if (!other.static || other.id === MIDDLE_LINE_ID) return;
    this.velocity.reflectN(response.overlapN.perp());
    this.velocity.scale(1.01);
    this.position.sub(response.overlapV);
    super.onCollision(response, other);
  }
}

export { Disc };
