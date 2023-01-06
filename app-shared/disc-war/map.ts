import SAT from "sat";
import { BodyEntity } from "../game/index.js";
import { LineShape } from "../physics/index.js";

const SIDE_WIDTH_RATIO = 0.8;
const SIDE_HEIGHT_RATIO = 0.7;

class Map {
  walls: BodyEntity[];

  constructor(worldWidth: number, worldHeight: number) {
    this.walls = [];
    const offsetX = 50;
    const offsetY = 30;
    const top = offsetY;
    const bot = worldHeight - offsetY;
    const left = offsetX;
    const right = worldWidth - offsetX;
    const width = worldWidth - offsetX * 2;
    const height = worldHeight - offsetY * 2;
    const sideWidth = width * SIDE_WIDTH_RATIO;
    const sideHeight = height * SIDE_HEIGHT_RATIO;
    const diagonalWidth = (width - sideWidth) / 2;
    const diagonalHeight = (height - sideHeight) / 2;

    // bottom walls
    // center
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(sideWidth, 0),
      new SAT.Vector(left + diagonalWidth, bot)
    );
    // left
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(diagonalWidth, diagonalHeight),
      new SAT.Vector(left, bot - diagonalHeight)
    );
    // right
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(diagonalWidth, -diagonalHeight),
      new SAT.Vector(right - diagonalWidth, bot)
    );

    // top walls
    // center
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(sideWidth, 0),
      new SAT.Vector(left + diagonalWidth, top)
    );
    // left
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(diagonalWidth, -diagonalHeight),
      new SAT.Vector(left, top + diagonalHeight)
    );
    // right
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(diagonalWidth, diagonalHeight),
      new SAT.Vector(right - diagonalWidth, top)
    );

    // side walls
    // left
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(0, sideHeight),
      new SAT.Vector(left, top + diagonalHeight)
    );
    // right
    this.addWall(
      new SAT.Vector(0, 0),
      new SAT.Vector(0, sideHeight),
      new SAT.Vector(right, top + diagonalHeight)
    );
  }

  addWall(p1: SAT.Vector, p2: SAT.Vector, position: SAT.Vector) {
    const wall = new BodyEntity(new LineShape(p1.x, p1.y, p2.x, p2.y));
    wall.setPosition(position.x, position.y);
    this.walls.push(wall);
  }
}

export { Map };
