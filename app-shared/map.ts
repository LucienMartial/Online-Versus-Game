import { Vector } from "sat";
import { Entity, LineShape } from "./physics";

const SIDE_WIDTH_RATIO = 0.8;
const SIDE_HEIGHT_RATIO = 0.7;

class Map {
  walls: Entity[];

  constructor(screenWidth: number, screenHeight: number) {
    this.walls = [];
    const offsetX = 50;
    const offsetY = 30;
    const top = offsetY;
    const bot = screenHeight - offsetY;
    const left = offsetX;
    const right = screenWidth - offsetX;
    const width = screenWidth - offsetX * 2;
    const height = screenHeight - offsetY * 2;
    const sideWidth = width * SIDE_WIDTH_RATIO;
    const sideHeight = height * SIDE_HEIGHT_RATIO;
    const diagonalWidth = (width - sideWidth) / 2;
    const diagonalHeight = (height - sideHeight) / 2;

    // bottom walls
    // center
    this.addWall(
      new Vector(0, 0),
      new Vector(sideWidth, 0),
      new Vector(left + diagonalWidth, bot)
    );
    // left
    this.addWall(
      new Vector(0, 0),
      new Vector(diagonalWidth, diagonalHeight),
      new Vector(left, bot - diagonalHeight)
    );
    // right
    this.addWall(
      new Vector(0, 0),
      new Vector(diagonalWidth, -diagonalHeight),
      new Vector(right - diagonalWidth, bot)
    );

    // top walls
    // center
    this.addWall(
      new Vector(0, 0),
      new Vector(sideWidth, 0),
      new Vector(left + diagonalWidth, top)
    );
    // left
    this.addWall(
      new Vector(0, 0),
      new Vector(diagonalWidth, -diagonalHeight),
      new Vector(left, top + diagonalHeight)
    );
    // right
    this.addWall(
      new Vector(0, 0),
      new Vector(diagonalWidth, diagonalHeight),
      new Vector(right - diagonalWidth, top)
    );

    // side walls
    // left
    this.addWall(
      new Vector(0, 0),
      new Vector(0, sideHeight),
      new Vector(left, top + diagonalHeight)
    );
    // right
    this.addWall(
      new Vector(0, 0),
      new Vector(0, sideHeight),
      new Vector(right, top + diagonalHeight)
    );
  }

  addWall(p1: Vector, p2: Vector, position: Vector) {
    const wall = new Entity(new LineShape(p1.x, p1.y, p2.x, p2.y), true);
    wall.setPosition(position.x, position.y);
    this.walls.push(wall);
  }
}

export { Map };
