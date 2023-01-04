import React, { useEffect, useState } from "react";
import "./App.css";
import { hello } from "../../app-shared/hello";
import { Message } from "../../app-shared/api-types";
import { io } from "socket.io-client";
import Game from "./components/Game";
import { Assets } from "@pixi/assets";

// assets information
const manifest = {
  bundles: [
    {
      name: "basic",
      assets: [
        {
          name: "character",
          srcs: "character.png",
        },
      ],
    },
  ],
};

function App() {
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false); // dev: true

  const fetchData = async () => {
    const res = await fetch("/api");
    const msg: Message = await res.json();
    console.log(msg);
    console.log(hello());
  };

  const initAssetsManifest = async () => {
    await Assets.init({ manifest: manifest });
    setLoaded(true);
  };

  useEffect(() => {
    fetchData();
    initAssetsManifest();
    const socket = io();
  }, []);

  if (!loaded) {
    return <p>Loading.. </p>;
  }

  if (started) {
    return <Game></Game>;
  }

  return (
    <React.StrictMode>
      <div className="App">
        <h1>Main Menu</h1>
        <div className="card">
          <button onClick={() => setStarted(true)}>Play</button>
        </div>
      </div>
    </React.StrictMode>
  );
}

export default App;
