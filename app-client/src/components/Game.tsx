import { useEffect, useRef } from "react";
import React from "react";
import { Application } from "pixi.js";
import { Viewport } from "pixi-viewport";
import "./Game.css";
import { GameScene } from "../game/game";
import { Client, Room } from "colyseus.js";
import { GameState } from "../../../app-shared/state/game-state";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../../../app-shared/utils/constants";

export interface GameProps {
  client: Client;
  gameRoom: Room<GameState>;
}

function Game({ client, gameRoom }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new Application({
      view: canvasRef.current!,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x000011,
    });

    // set viewport
    const viewport = new Viewport({
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      passiveWheel: false,
    });

    app.stage.addChild(viewport);
    viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    viewport.fit();

    // init scene
    const gameScene = new GameScene(client, gameRoom);
    gameScene.load().then(() => {
      viewport.addChild(gameScene.stage);
      // launch game
      window.requestAnimationFrame(schedule);
    });

    // scheduler
    let last = Date.now();
    function schedule() {
      const now = Date.now();
      const dt = (now - last) * 0.001;
      last = now;
      gameScene.update(dt);
      gameScene.updateRenderables(dt);
      window.requestAnimationFrame(schedule);
    }

    // resize
    const resize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      viewport.resize(window.innerWidth, window.innerHeight);
      viewport.fit();
      viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    };
    resize();
    window.addEventListener("resize", resize);

    // on unmount
    return () => {
      viewport.destroy();
      app.destroy();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main id="game">
      <React.StrictMode>
        <div id="gui" ref={guiRef}>
          <p>Hello from GUI</p>
        </div>
      </React.StrictMode>
      <canvas ref={canvasRef}></canvas>
    </main>
  );
}

export default Game;
