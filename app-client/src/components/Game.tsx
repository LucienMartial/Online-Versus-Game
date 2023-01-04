import { useEffect, useRef } from "react";
import React from "react";
import { Application } from "pixi.js";
import { Viewport } from "pixi-viewport";
import "./Game.css";
import { Scene } from "../game/scene";

function Game() {
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
    const width = 1600;
    const height = 900;
    const viewport = new Viewport({
      worldWidth: width,
      worldHeight: height,
      passiveWheel: false,
    });

    app.stage.addChild(viewport);
    viewport.moveCenter(width / 2, height / 2);
    viewport.fit();

    // init scene
    const scene = new Scene(width, height);
    scene.load().then(() => {
      viewport.addChild(scene.stage);
      // launch game
      window.requestAnimationFrame(schedule);
    });

    // scheduler
    let last = Date.now();
    function schedule() {
      const now = Date.now();
      const dt = (now - last) * 0.001;
      last = now;
      scene.update(now, dt);
      window.requestAnimationFrame(schedule);
    }

    // resize
    const resize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      viewport.resize(window.innerWidth, window.innerHeight);
      viewport.fit();
      viewport.moveCenter(width / 2, height / 2);
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
