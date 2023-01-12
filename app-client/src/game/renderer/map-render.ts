import { BodyEntity } from "../../../../app-shared/game";
import { LineShape } from "../../../../app-shared/physics";
import { PolylineShape } from "../../../../app-shared/physics";
import { Graphics } from "../utils/graphics";
import { RenderObject } from "./render-object";
import { Vector } from "sat";

class MapRender extends RenderObject {
  constructor(walls: Set<BodyEntity>, splitLine: BodyEntity) {
    super();

    for (const wall of walls) {
      this.renderPolylineShape(wall.collisionShape as PolylineShape, new Vector(wall.position.x, wall.position.y));
    }
    
    this.renderPolylineShape(splitLine.collisionShape as PolylineShape, new Vector(splitLine.position.x, splitLine.position.y), 0x00FF00);
  }

  renderPolylineShape(shape: PolylineShape, position: SAT.Vector, color: number = 0xFF0000) {
    const displayLine = Graphics.createLine(
      shape.p1.x,
      shape.p1.y,
      shape.p2.x,
      shape.p2.y,
      shape.thickness,
      color
    );
    displayLine.position.set(position.x, position.y);
    this.addChild(displayLine);
  }
}

export { MapRender };
